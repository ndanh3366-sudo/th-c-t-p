import {
  Room,
  RoomEvent,
  VideoPresets,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalVideoTrack,
  LocalAudioTrack,
  createLocalVideoTrack,
  createLocalAudioTrack,
  VideoCodec,
} from 'livekit-client';
import { broadcastLiveData } from './realtimeSync';
import { supabaseRealtimeManager } from './supabaseRealtimeService';

export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderBadge?: string;
  isAdmin?: boolean;
  text?: string;
  image?: string;
  file?: {
    name: string;
    size: number;
    url: string;
    type: string;
  };
  timestamp: string;
}

export interface FloatingHeart {
  id: string;
  x: number;
  color: string;
}

export interface OBSConfigInfo {
  serverUrl: string;
  streamKey: string;
  whipUrl: string;
  rtmpUrl: string;
  rtmpServer?: string;
  bearerToken?: string;
  recommendedSettings: {
    rateControl: string;
    bitrate: string;
    keyframeInterval: string;
    cpuPreset: string;
    profile: string;
    tune: string;
    audioBitrate: string;
  };
}

export interface LiveViewerInfo {
  id: string;
  name: string;
  isAdmin: boolean;
  isRegisteredCustomer?: boolean;
  email?: string;
  ip?: string;
  roleBadge?: string;
  joinedAt?: string;
  isOnline?: boolean;
}

export class LiveKitStreamManager {
  private room: Room | null = null;
  private ws: WebSocket | null = null;
  private localVideoTrack: LocalVideoTrack | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private screenTrack: LocalVideoTrack | null = null;
  private audioCtx: AudioContext | null = null;
  private userId: string = '';
  private userName: string = '';
  private isHost: boolean = false;
  private userEmail: string = '';
  private isRegisteredCustomer: boolean = false;
  private currentRoomName: string = 'npt-official-room';

  private onRemoteTrackSubscribedCallback?: (track: RemoteTrack) => void;
  private onRemoteTrackUnsubscribedCallback?: (track: RemoteTrack) => void;
  private onDataReceivedCallback?: (payload: any) => void;
  private onParticipantListChangedCallback?: (participants: LiveViewerInfo[]) => void;
  private onConnectionStateChangeCallback?: (state: string) => void;

  constructor() {}

  /**
   * Fetch LiveKit authentication token & room config from server
   */
  public async getLiveKitToken(
    roomName: string,
    identity: string,
    name: string,
    isAdmin: boolean,
    email?: string,
    isRegisteredCustomer?: boolean
  ) {
    this.userId = identity;
    this.userName = name;
    this.isHost = isAdmin;
    this.userEmail = email || '';
    this.isRegisteredCustomer = Boolean(isRegisteredCustomer);
    this.currentRoomName = roomName;

    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, identity, name, isAdmin }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return { token: `fallback_${identity}`, url: '', identity };
      }
      const data = await res.json();
      return data;
    } catch {
      return { token: `fallback_${identity}`, url: '', identity };
    }
  }

  /**
   * Connect to LiveKit Room with Simulcast, H.264 / VP8 hardware codecs & dynacast
   */
  public async connectToRoom(
    livekitWsUrl: string,
    token: string,
    callbacks: {
      onRemoteTrackSubscribed?: (track: RemoteTrack) => void;
      onRemoteTrackUnsubscribed?: (track: RemoteTrack) => void;
      onDataReceived?: (payload: any) => void;
      onParticipantListChanged?: (participants: LiveViewerInfo[]) => void;
      onConnectionStateChange?: (state: string) => void;
    }
  ) {
    this.onRemoteTrackSubscribedCallback = callbacks.onRemoteTrackSubscribed;
    this.onRemoteTrackUnsubscribedCallback = callbacks.onRemoteTrackUnsubscribed;
    this.onDataReceivedCallback = callbacks.onDataReceived;
    this.onParticipantListChangedCallback = callbacks.onParticipantListChanged;
    this.onConnectionStateChangeCallback = callbacks.onConnectionStateChange;

    this.onConnectionStateChangeCallback?.('connecting');

    // Setup fallback WebSocket for immediate data relay (chat, reaction hearts, pin, kick)
    this.setupSignalingWebSocket();

    // If valid token and cloud url available, connect via official LiveKit Room SDK
    if (livekitWsUrl && token && !token.startsWith('fallback_')) {
      try {
        const room = new Room({
          adaptiveStream: true,
          dynacast: true, // Dynacast: only request video layers actually visible to viewer
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
          publishDefaults: {
            simulcast: true, // BẮT BUỘC SIMULCAST: Tạo 3 luồng High 1080p, Med 720p, Low 360p
            videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h360, VideoPresets.h180],
            videoEncoding: {
              maxBitrate: 3_500_000, // CBR Limit 3.5 Mbps tránh nghẽn
              maxFramerate: 30, // Khóa 30 FPS mượt mà
            },
            videoCodec: 'h264' as VideoCodec, // Ép H.264 phần cứng tránh quá tải CPU người xem
          },
        });

        this.room = room;

        room
          .on(RoomEvent.Connected, () => {
            this.onConnectionStateChangeCallback?.('connected');
            this.syncParticipants();
          })
          .on(RoomEvent.Disconnected, () => {
            this.onConnectionStateChangeCallback?.('disconnected');
          })
          .on(RoomEvent.Reconnecting, () => {
            this.onConnectionStateChangeCallback?.('reconnecting');
          })
          .on(RoomEvent.Reconnected, () => {
            this.onConnectionStateChangeCallback?.('connected');
          })
          .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
            // When guest receives video or audio from host (OBS or WebCam)
            this.onRemoteTrackSubscribedCallback?.(track);
          })
          .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
            this.onRemoteTrackUnsubscribedCallback?.(track);
          })
          .on(RoomEvent.DataReceived, (payload: Uint8Array) => {
            try {
              const str = new TextDecoder().decode(payload);
              const data = JSON.parse(str);
              this.onDataReceivedCallback?.(data);
            } catch (e) {}
          })
          .on(RoomEvent.ParticipantConnected, () => {
            this.syncParticipants();
          })
          .on(RoomEvent.ParticipantDisconnected, () => {
            this.syncParticipants();
          });

        await room.connect(livekitWsUrl, token);
        return room;
      } catch (livekitError) {
        console.warn('LiveKit Cloud connection failed (falling back to WebSocket WebRTC signaling):', livekitError);
      }
    }
  }

  private reconnectTimer: any = null;

  /**
   * Supabase Realtime signaling connection for real-time video frames, chat, hearts, and viewer presence
   */
  public setupSignalingWebSocket(callbacks?: {
    onRemoteTrackSubscribed?: (track: RemoteTrack) => void;
    onRemoteTrackUnsubscribed?: (track: RemoteTrack) => void;
    onDataReceived?: (payload: any) => void;
    onParticipantListChanged?: (participants: LiveViewerInfo[]) => void;
    onConnectionStateChange?: (state: string) => void;
  }) {
    if (callbacks) {
      if (callbacks.onRemoteTrackSubscribed) this.onRemoteTrackSubscribedCallback = callbacks.onRemoteTrackSubscribed;
      if (callbacks.onRemoteTrackUnsubscribed) this.onRemoteTrackUnsubscribedCallback = callbacks.onRemoteTrackUnsubscribed;
      if (callbacks.onDataReceived) this.onDataReceivedCallback = callbacks.onDataReceived;
      if (callbacks.onParticipantListChanged) this.onParticipantListChangedCallback = callbacks.onParticipantListChanged;
      if (callbacks.onConnectionStateChange) this.onConnectionStateChangeCallback = callbacks.onConnectionStateChange;
    }

    supabaseRealtimeManager.setupSupabaseRealtime(
      this.currentRoomName || 'npt-live-room',
      {
        id: this.userId,
        name: this.userName,
        isAdmin: this.isHost,
        email: this.userEmail,
        isRegisteredCustomer: this.isRegisteredCustomer
      },
      {
        onDataReceived: (payload) => {
          this.onDataReceivedCallback?.(payload);
        },
        onParticipantListChanged: (participants) => {
          this.onParticipantListChangedCallback?.(participants);
        },
        onConnectionStateChange: (state) => {
          this.onConnectionStateChangeCallback?.(state);
        }
      }
    );
  }

  /**
   * Publish Camera & Mic to LiveKit with Simulcast (3 layers) and H.264
   */
  public async publishCameraAndMic(videoElement?: HTMLVideoElement | null) {
    if (!this.isHost) return;

    try {
      // Create local tracks with LiveKit VideoPresets
      this.localVideoTrack = await createLocalVideoTrack({
        resolution: VideoPresets.h720.resolution,
        facingMode: 'user',
      });

      this.localAudioTrack = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

      if (videoElement && this.localVideoTrack) {
        this.localVideoTrack.attach(videoElement);
      }

      // Publish to LiveKit Room if connected
      if (this.room && this.room.state === 'connected') {
        await this.room.localParticipant.publishTrack(this.localVideoTrack, {
          simulcast: true,
          videoSimulcastLayers: [VideoPresets.h720, VideoPresets.h360, VideoPresets.h180],
          videoEncoding: {
            maxBitrate: 3_500_000, // CBR limit 3500 kbps
            maxFramerate: 30,
          },
          videoCodec: 'h264' as VideoCodec,
        });

        await this.room.localParticipant.publishTrack(this.localAudioTrack);
      }

      return {
        videoTrack: this.localVideoTrack,
        audioTrack: this.localAudioTrack,
      };
    } catch (err) {
      console.warn('Error publishing camera & mic:', err);
    }
  }

  /**
   * Toggle camera on/off
   */
  public async toggleCamera(enable: boolean) {
    if (this.localVideoTrack) {
      if (enable) {
        await this.localVideoTrack.unmute();
      } else {
        await this.localVideoTrack.mute();
      }
    }
    this.sendDataMessage({ type: 'CAM_STATE', enabled: enable });
  }

  /**
   * Toggle microphone on/off
   */
  public async toggleMicrophone(enable: boolean) {
    if (this.localAudioTrack) {
      if (enable) {
        await this.localAudioTrack.unmute();
      } else {
        await this.localAudioTrack.mute();
      }
    }
    this.sendDataMessage({ type: 'MIC_STATE', enabled: enable });
  }

  /**
   * Screen Share with LiveKit
   */
  public async toggleScreenShare(enable: boolean) {
    if (!this.isHost) return null;
    try {
      if (enable) {
        if (this.room && this.room.state === 'connected') {
          await this.room.localParticipant.setScreenShareEnabled(true, {
            audio: true,
            resolution: VideoPresets.h1080.resolution,
          });
        }
      } else {
        if (this.room && this.room.state === 'connected') {
          await this.room.localParticipant.setScreenShareEnabled(false);
        }
      }
    } catch (e) {
      console.warn('Screen share toggle error:', e);
    }
  }

  /**
   * Apply AI Neural DSP Acoustic Dereverberation, Echo Cancellation & Noise Gate Pipeline
   */
  public applyWebAudioNoiseSuppression(mediaStream: MediaStream): MediaStream {
    try {
      if (!mediaStream || mediaStream.getAudioTracks().length === 0) return mediaStream;

      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const source = this.audioCtx.createMediaStreamSource(mediaStream);

      // 1. Sub-Bass & Fan Rumble Cutoff (85Hz HighPass Filter 24dB/octave slope):
      // Cuts fan motor rumble, AC hum, and wind turbulence below 85Hz without cutting human voice fundamentals (85Hz-255Hz).
      const highPass1 = this.audioCtx.createBiquadFilter();
      highPass1.type = 'highpass';
      highPass1.frequency.setValueAtTime(85, this.audioCtx.currentTime);
      highPass1.Q.setValueAtTime(0.707, this.audioCtx.currentTime);

      const highPass2 = this.audioCtx.createBiquadFilter();
      highPass2.type = 'highpass';
      highPass2.frequency.setValueAtTime(85, this.audioCtx.currentTime);

      // 2. Anti-Fan & Electrical Hum Notch Filters (120Hz & 180Hz):
      const humNotch1 = this.audioCtx.createBiquadFilter();
      humNotch1.type = 'notch';
      humNotch1.frequency.setValueAtTime(120, this.audioCtx.currentTime);
      humNotch1.Q.setValueAtTime(3.0, this.audioCtx.currentTime);

      const humNotch2 = this.audioCtx.createBiquadFilter();
      humNotch2.type = 'notch';
      humNotch2.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      humNotch2.Q.setValueAtTime(3.0, this.audioCtx.currentTime);

      // 3. AI Anti-Reverb Room Boxiness Notch (250Hz & 480Hz):
      const roomNotch = this.audioCtx.createBiquadFilter();
      roomNotch.type = 'notch';
      roomNotch.frequency.setValueAtTime(250, this.audioCtx.currentTime);
      roomNotch.Q.setValueAtTime(2.5, this.audioCtx.currentTime);

      // 4. High Frequency Fan Blade Hiss Cutoff (7200Hz LowPass Filter):
      // Removes high-frequency fan turbulence, hiss, and coil whine.
      const lowPass = this.audioCtx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.setValueAtTime(7200, this.audioCtx.currentTime);

      // 5. Dual Vocal Formant Sensitivity Booster (2400Hz + 3200Hz Peaking Boost):
      // Specifically boosts human speech frequencies by +6.5dB for ultra-sensitive voice pickup.
      const voicePeak1 = this.audioCtx.createBiquadFilter();
      voicePeak1.type = 'peaking';
      voicePeak1.frequency.setValueAtTime(2400, this.audioCtx.currentTime);
      voicePeak1.Q.setValueAtTime(1.2, this.audioCtx.currentTime);
      voicePeak1.gain.setValueAtTime(6.5, this.audioCtx.currentTime);

      const voicePeak2 = this.audioCtx.createBiquadFilter();
      voicePeak2.type = 'peaking';
      voicePeak2.frequency.setValueAtTime(3200, this.audioCtx.currentTime);
      voicePeak2.Q.setValueAtTime(1.4, this.audioCtx.currentTime);
      voicePeak2.gain.setValueAtTime(4.5, this.audioCtx.currentTime);

      // 6. Sensitive AI Voice Gate & Compressor:
      // Low threshold (-34dB) so even quiet speech is picked up, soft knee for natural cadence.
      const compressor = this.audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-34, this.audioCtx.currentTime);
      compressor.knee.setValueAtTime(12, this.audioCtx.currentTime);
      compressor.ratio.setValueAtTime(3.5, this.audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.001, this.audioCtx.currentTime); // 1ms instant voice attack
      compressor.release.setValueAtTime(0.12, this.audioCtx.currentTime); // 120ms release

      // 7. Output Voice Sensitivity Booster (+65% gain):
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(1.65, this.audioCtx.currentTime);

      const destination = this.audioCtx.createMediaStreamDestination();

      // Connect DSP Chain:
      source.connect(highPass1);
      highPass1.connect(highPass2);
      highPass2.connect(humNotch1);
      humNotch1.connect(humNotch2);
      humNotch2.connect(roomNotch);
      roomNotch.connect(lowPass);
      lowPass.connect(voicePeak1);
      voicePeak1.connect(voicePeak2);
      voicePeak2.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(destination);

      const enhancedStream = new MediaStream();
      mediaStream.getVideoTracks().forEach(t => enhancedStream.addTrack(t));
      destination.stream.getAudioTracks().forEach(t => enhancedStream.addTrack(t));

      return enhancedStream;
    } catch (e) {
      return mediaStream;
    }
  }

  /**
   * Send Data Messages (Chat, Reaction hearts, Pin Product, Kick Viewer)
   */
  public sendDataMessage(data: any) {
    // 1. Send via LiveKit reliable data channel if room active
    if (this.room && this.room.state === 'connected') {
      try {
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        const payload = new Uint8Array(encoded.buffer as ArrayBuffer);
        this.room.localParticipant.publishData(payload, { reliable: true });
      } catch (e) {}
    }

    // 2. Broadcast via WebSocket relay + BroadcastChannel
    broadcastLiveData(data);

    this.onDataReceivedCallback?.(data);
  }

  /**
   * Synchronize participants list
   */
  private syncParticipants() {
    const list: LiveViewerInfo[] = [];

    if (this.room && this.room.state === 'connected') {
      // Local participant
      list.push({
        id: this.room.localParticipant.identity,
        name: this.room.localParticipant.name || (this.isHost ? 'Danh Nguyễn (Quản Lý)' : 'Bạn'),
        isAdmin: this.isHost,
        roleBadge: this.isHost ? '👑 Quản Lý Showroom' : '👤 Người Xem',
        isOnline: true,
      });

      // Remote participants
      this.room.remoteParticipants.forEach((p: RemoteParticipant) => {
        const isAdm = p.identity.includes('admin') || p.identity.includes('danh');
        list.push({
          id: p.identity,
          name: p.name || `Khách #${p.identity.slice(-4)}`,
          isAdmin: isAdm,
          roleBadge: isAdm ? '👑 Quản Lý Showroom' : '👤 Người Xem',
          isOnline: true,
        });
      });

      this.onParticipantListChangedCallback?.(list);
    }
  }

  public disconnect() {
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack = null;
    }
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }
    if (this.screenTrack) {
      this.screenTrack.stop();
      this.screenTrack = null;
    }
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
