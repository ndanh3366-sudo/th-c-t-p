import React, { useState, useEffect, useRef } from 'react';
import { Product, User } from '../types';
import { LiveKitStreamManager, LiveChatMessage, FloatingHeart, OBSConfigInfo, LiveViewerInfo } from '../services/livekitService';
import { showToast } from '../utils/sound';
import { 
  publishLiveStateToCloud, 
  subscribeToLiveState, 
  subscribeToLiveFeed,
  startHostWebRTCStream,
  connectGuestWebRTCStream,
  playSeamlessAudioChunk,
  sendHostHeartbeat,
  sendEndLiveBeacon,
  HostWebRTCController
} from '../services/realtimeSync';

interface LiveStreamViewProps {
  currentUser: User | null;
  isAdminAuthenticated: boolean;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onCloseLive?: () => void;
  onOpenAuth?: () => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  currentUser,
  isAdminAuthenticated,
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onCloseLive,
  onOpenAuth,
}) => {
  const isAdmin = (currentUser?.role === 'admin' || isAdminAuthenticated) ?? false;
  
  // Persistent visitor ID for unauthenticated guests
  const [visitorId] = useState<string>(() => {
    try {
      let saved = sessionStorage.getItem('npt_visitor_id') || localStorage.getItem('npt_visitor_id');
      if (!saved) {
        saved = 'visitor_' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('npt_visitor_id', saved);
      }
      return saved;
    } catch {
      return 'visitor_' + Math.floor(1000 + Math.random() * 9000);
    }
  });

  const currentUserId = isAdmin ? 'admin_danh_nguyen' : (currentUser ? currentUser.id : visitorId);
  const currentUserName = isAdmin
    ? 'Danh Nguyễn (Quản Lý)'
    : (currentUser ? currentUser.name : `Khách ghé thăm #${visitorId.slice(-4)}`);

  // Live Stream State
  const [isLive, setIsLive] = useState<boolean>(false);
  const [streamTitle, setStreamTitle] = useState<string>(
    '🔴 LỄ RA MẮT SIÊU PHẨM DX & CSM KAMEN RIDER 2026 - SHOWROOM NPTTEAMSTORE'
  );
  const [viewersCount, setViewersCount] = useState<number>(1);
  const [pinnedProduct, setPinnedProduct] = useState<Product | null>(() => products[0] || null);

  // Realtime Cloud Live State Synchronization (across all Vercel clients worldwide)
  useEffect(() => {
    const unsubscribe = subscribeToLiveState((cloudState) => {
      if (typeof cloudState.isLive === 'boolean') {
        setIsLive(cloudState.isLive);
      }
      if (cloudState.title) {
        setStreamTitle(cloudState.title);
      }
      if (cloudState.pinnedProductId) {
        const foundProd = products.find(p => p.id === cloudState.pinnedProductId);
        if (foundProd) setPinnedProduct(foundProd);
      }
    });

    return () => unsubscribe();
  }, [products]);

  // Host Media Controls (Admin Only)
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState<boolean>(false);
  const [noiseFilterActive, setNoiseFilterActive] = useState<boolean>(true);

  // Broadcast Mode for Admin: WebRTC Camera or OBS Studio (WHIP / RTMP)
  const [streamSourceMode, setStreamSourceMode] = useState<'camera' | 'obs'>('camera');
  const [isOBSModalOpen, setIsOBSModalOpen] = useState<boolean>(false);
  const [obsConfig, setOBSConfig] = useState<OBSConfigInfo | null>(null);
  const [activeQualityLayer, setActiveQualityLayer] = useState<'Tự động' | '1080p' | '720p' | '360p'>('Tự động');
  const [availableVideoDevices, setAvailableVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Receiver Video State for Guest
  const [hasReceivedLiveVideo, setHasReceivedLiveVideo] = useState<boolean>(false);
  const [hostCamEnabled, setHostCamEnabled] = useState<boolean>(true);

  // Connection & Participant State (100% Real connected viewers only)
  const [connectionState, setConnectionState] = useState<string>('connected');
  const [participants, setParticipants] = useState<LiveViewerInfo[]>([
    {
      id: currentUserId,
      name: currentUserName,
      isAdmin,
      isRegisteredCustomer: Boolean(currentUser && !isAdmin),
      email: currentUser?.email,
      roleBadge: isAdmin ? '👑 Quản Lý Showroom' : (currentUser ? '⭐ Thành Viên Đã Đăng Ký' : '👤 Khách Trực Tuyến'),
      joinedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOnline: true,
    }
  ]);
  const [isKicked, setIsKicked] = useState<boolean>(false);

  // Keep viewers count strictly in sync with real participants list
  useEffect(() => {
    setViewersCount(participants.length > 0 ? participants.length : 1);
  }, [participants]);

  // Media & Broadcaster Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const guestVideoRef = useRef<HTMLVideoElement | null>(null);
  const guestCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const liveKitManagerRef = useRef<LiveKitStreamManager | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // WebRTC Broadcaster & Audio Mixer Refs (Zero Latency 60 FPS & HD Sound)
  const hostBroadcasterRef = useRef<HostWebRTCController | null>(null);
  const audioMixerContextRef = useRef<AudioContext | null>(null);
  const micAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const screenAudioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioMixerDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const activeBroadcastStreamRef = useRef<MediaStream | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const reusableImgRef = useRef<HTMLImageElement | null>(null);

  // Guest Audio Volume & Unmute State
  const [isGuestAudioMuted, setIsGuestAudioMuted] = useState<boolean>(false);
  const [guestVolume, setGuestVolume] = useState<number>(1);
  const guestVolumeRef = useRef<number>(1);
  useEffect(() => {
    guestVolumeRef.current = guestVolume;
  }, [guestVolume]);

  // Chat & Attachments State - Only official Host welcome announcement initially
  const [messages, setMessages] = useState<LiveChatMessage[]>([
    {
      id: 'm-welcome',
      senderId: 'admin_danh_nguyen',
      senderName: 'Danh Nguyễn',
      senderBadge: '👑 HOST / QUẢN LÝ',
      isAdmin: true,
      text: 'Chào mừng tất cả anh em Tokufan đến với buổi Live Stream chính hãng NPTTEAMSTORE! Anh em cần test âm thanh đai nào hãy bình luận bên dưới nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; url: string; type: string } | null>(null);
  
  // UI Tabs & Modals
  const [chatTab, setChatTab] = useState<'chat' | 'viewers' | 'products'>('chat');
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [selectedImageLightbox, setSelectedImageLightbox] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Fetch OBS Studio configurations
  useEffect(() => {
    if (isAdmin) {
      fetch('/api/live/obs-config')
        .then(res => {
          if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data) setOBSConfig(data);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  // Auto-scroll chat to bottom inside chat container ONLY (STRICTLY prevents window scrolling down to footer)
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = (force = false) => {
    const el = chatContainerRef.current;
    if (el) {
       const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 160;
       if (isAtBottom || force) {
         const currentWindowY = window.scrollY;
         el.scrollTop = el.scrollHeight;
         // Enforce window scroll position remains fixed (never jump to footer)
         if (window.scrollY !== currentWindowY) {
           window.scrollTo({ top: currentWindowY, behavior: 'instant' as ScrollBehavior });
         }
       }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync user changes to LiveKit Manager & WebSocket
  useEffect(() => {
    if (liveKitManagerRef.current) {
      liveKitManagerRef.current.sendDataMessage({
        type: 'JOIN',
        user: {
          id: currentUserId,
          name: currentUserName,
          isAdmin,
          isRegisteredCustomer: Boolean(currentUser && !isAdmin),
          email: currentUser?.email || '',
        }
      });
    }
  }, [currentUser, isAdmin, currentUserId, currentUserName]);

  // Initialize LiveKit & WebSocket Connection
  useEffect(() => {
    const manager = new LiveKitStreamManager();
    liveKitManagerRef.current = manager;

    const processLiveDataMessage = (data: any) => {
      if (!data) return;
      if (data.type === 'CHAT') {
        if (data.message) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
      } else if (data.type === 'VIEWERS_UPDATE' && Array.isArray(data.viewers)) {
        setParticipants(data.viewers);
        setViewersCount(data.viewers.length > 0 ? data.viewers.length : 1);
      } else if (data.type === 'HEART') {
        triggerHeartAnimation(data.x || Math.random() * 80 + 10);
      } else if (data.type === 'PIN_PRODUCT' && data.product) {
        setPinnedProduct(data.product);
        showToast(`📌 Quản lý đã ghim sản phẩm: ${data.product.name}`, 'info');
      } else if (data.type === 'KICK_VIEWER') {
        if (data.targetUserId === currentUserId) {
          setIsKicked(true);
          showToast('🚫 BẠN ĐÃ BỊ MỜI RA KHỎI PHIÊN LIVE STREAM!', 'error');
        } else {
          setParticipants(prev => prev.filter(p => p.id !== data.targetUserId));
        }
      } else if (data.type === 'LIVE_STATE') {
        setIsLive(data.isLive);
        if (data.title) setStreamTitle(data.title);
      } else if (data.type === 'CAM_STATE') {
        setHostCamEnabled(data.enabled);
      } else if (data.type === 'VIDEO_FRAME' && !isAdmin && data.frame) {
        setHostCamEnabled(true);
        const frameTime = typeof data.t === 'number' ? data.t : 0;
        if (frameTime && frameTime < lastFrameTimeRef.current) return;
        if (frameTime) lastFrameTimeRef.current = frameTime;

        if (guestCanvasRef.current) {
          const canvas = guestCanvasRef.current;
          if (!reusableImgRef.current) {
            reusableImgRef.current = new Image();
          }
          const img = reusableImgRef.current;
          img.onload = () => {
            requestAnimationFrame(() => {
              if (canvas) {
                if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                  canvas.width = img.naturalWidth || 640;
                  canvas.height = img.naturalHeight || 360;
                }
                const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                }
              }
            });
          };
          img.src = data.frame;
        }
      } else if (data.type === 'AUDIO_CHUNK' && !isAdmin && data.audio) {
        playSeamlessAudioChunk(data.audio);
      }
    };

    // Initialize WebSocket Signaling Connection immediately
    manager.setupSignalingWebSocket({
      onDataReceived: (data) => processLiveDataMessage(data),
      onParticipantListChanged: (list) => {
        if (list && list.length > 0) {
          setParticipants(list);
          setViewersCount(list.length);
        }
      },
      onConnectionStateChange: (state) => {
        setConnectionState(state);
      },
    });

    // Subscribe to Cloud Firestore + BroadcastChannel + WebSocket Live Feed
    const unsubscribeFeed = subscribeToLiveFeed((data) => {
      processLiveDataMessage(data);
    });

    const setupLiveStream = async () => {
      try {
        const tokenRes = await manager.getLiveKitToken(
          'npt-official-room',
          currentUserId,
          currentUserName,
          isAdmin,
          currentUser?.email,
          Boolean(currentUser && !isAdmin)
        );

        await manager.connectToRoom(tokenRes.url, tokenRes.token, {
          onRemoteTrackSubscribed: (track) => {
            // LiveKit WebRTC Track received from OBS or Host Browser
            setHasReceivedLiveVideo(true);
            setHostCamEnabled(true);
            if (guestVideoRef.current && track.kind === 'video') {
              track.attach(guestVideoRef.current);
            }
          },
          onRemoteTrackUnsubscribed: (track) => {
            if (guestVideoRef.current && track.kind === 'video') {
              track.detach(guestVideoRef.current);
            }
          },
          onDataReceived: (data) => {
            processLiveDataMessage(data);
          },
          onParticipantListChanged: (list) => {
            if (list && list.length > 0) {
              setParticipants(list);
              setViewersCount(list.length);
            }
          },
          onConnectionStateChange: (state) => {
            setConnectionState(state);
          },
        });
      } catch (err) {
        console.warn('LiveKit setup fallback:', err);
      }
    };

    setupLiveStream();

    return () => {
      unsubscribeFeed();
      manager.disconnect();
    };
  }, [isAdmin, currentUserId, currentUserName, currentUser]);

  // Helper to get or create host audio mixer for studio mic + screen system audio
  const getAudioMixer = () => {
    if (!audioMixerContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioMixerContextRef.current = new AudioCtx();
    }
    const ctx = audioMixerContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!audioMixerDestinationRef.current) {
      audioMixerDestinationRef.current = ctx.createMediaStreamDestination();
    }
    return { ctx, destination: audioMixerDestinationRef.current };
  };

  const updateHostAudioMix = () => {
    try {
      const { ctx, destination } = getAudioMixer();

      // Disconnect existing sources cleanly
      if (micAudioSourceRef.current) {
        try { micAudioSourceRef.current.disconnect(); } catch {}
        micAudioSourceRef.current = null;
      }
      if (screenAudioSourceRef.current) {
        try { screenAudioSourceRef.current.disconnect(); } catch {}
        screenAudioSourceRef.current = null;
      }

      // Connect mic track with Studio Anti-Echo & Dereverberation DSP Chain
      if (micEnabled && localStreamRef.current) {
        const micTracks = localStreamRef.current.getAudioTracks();
        if (micTracks.length > 0 && micTracks[0].enabled) {
          const micStream = new MediaStream([micTracks[0]]);
          const micSource = ctx.createMediaStreamSource(micStream);
          micAudioSourceRef.current = micSource;

          if (noiseFilterActive) {
            // 1. Acoustic Low-Cut (Highpass filter at 100Hz):
            // Cuts room floor vibrations, AC rumble, and desk thumps that excite room modes
            const highPass = ctx.createBiquadFilter();
            highPass.type = 'highpass';
            highPass.frequency.setValueAtTime(100, ctx.currentTime);
            highPass.Q.setValueAtTime(0.707, ctx.currentTime);

            // 2. Primary De-Reverberation Notch (315Hz):
            // Eliminates the classic "cardboard box / empty bathroom" acoustic resonance
            const deReverbNotch1 = ctx.createBiquadFilter();
            deReverbNotch1.type = 'peaking';
            deReverbNotch1.frequency.setValueAtTime(315, ctx.currentTime);
            deReverbNotch1.Q.setValueAtTime(2.2, ctx.currentTime);
            deReverbNotch1.gain.setValueAtTime(-5.0, ctx.currentTime);

            // 3. Secondary Wall-Echo Notch (480Hz):
            // Eliminates flutter reflections between parallel room walls
            const deReverbNotch2 = ctx.createBiquadFilter();
            deReverbNotch2.type = 'peaking';
            deReverbNotch2.frequency.setValueAtTime(480, ctx.currentTime);
            deReverbNotch2.Q.setValueAtTime(2.5, ctx.currentTime);
            deReverbNotch2.gain.setValueAtTime(-4.0, ctx.currentTime);

            // 4. Vocal Consonant Presence EQ (3200Hz):
            // Enhances clarity and speech articulation (+2dB)
            const presence = ctx.createBiquadFilter();
            presence.type = 'peaking';
            presence.frequency.setValueAtTime(3200, ctx.currentTime);
            presence.Q.setValueAtTime(1.4, ctx.currentTime);
            presence.gain.setValueAtTime(2.0, ctx.currentTime);

            // 5. Studio Broadcast Voice Dynamics Compressor:
            // Prevents speech burst distortion and reduces sound pressure bouncing off walls
            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-22, ctx.currentTime);
            compressor.knee.setValueAtTime(8, ctx.currentTime);
            compressor.ratio.setValueAtTime(3.0, ctx.currentTime);
            compressor.attack.setValueAtTime(0.002, ctx.currentTime);
            compressor.release.setValueAtTime(0.080, ctx.currentTime);

            // 6. Clean Master Mic Gain (Normalized 1.05 - Natural and articulate, no reverb boost)
            const micGain = ctx.createGain();
            micGain.gain.setValueAtTime(1.05, ctx.currentTime);

            // Assemble DSP Node Pipeline
            micSource.connect(highPass);
            highPass.connect(deReverbNotch1);
            deReverbNotch1.connect(deReverbNotch2);
            deReverbNotch2.connect(presence);
            presence.connect(compressor);
            compressor.connect(micGain);
            micGain.connect(destination);
          } else {
            // Direct clean pass-through
            const directGain = ctx.createGain();
            directGain.gain.setValueAtTime(1.0, ctx.currentTime);
            micSource.connect(directGain);
            directGain.connect(destination);
          }
        }
      }

      // Connect screen audio track if screen sharing (system sounds / presentation audio)
      if (screenShareEnabled && screenStreamRef.current) {
        const screenAudioTracks = screenStreamRef.current.getAudioTracks();
        if (screenAudioTracks.length > 0 && screenAudioTracks[0].enabled) {
          const screenAudioStream = new MediaStream([screenAudioTracks[0]]);
          const screenSource = ctx.createMediaStreamSource(screenAudioStream);
          screenAudioSourceRef.current = screenSource;

          // Pristine uncompressed pass-through for system presentation sound
          const screenGain = ctx.createGain();
          screenGain.gain.setValueAtTime(1.0, ctx.currentTime);
          screenSource.connect(screenGain);
          screenGain.connect(destination);
        }
      }

      // Hot-swap audio track on WebRTC broadcaster to all connected viewers with 0ms delay
      const mixedTrack = destination.stream.getAudioTracks()[0] || null;
      if (hostBroadcasterRef.current && mixedTrack) {
        hostBroadcasterRef.current.replaceAudioTrack(mixedTrack);
      }
    } catch (e) {
      console.warn('Audio mixer update note:', e);
    }
  };

  // WebRTC Host Stream Signaling (0ms Latency 30-60 FPS P2P Broadcast with Dynamic Audio Mixer)
  useEffect(() => {
    if (isAdmin && isLive) {
      updateHostAudioMix();
      const { destination } = getAudioMixer();
      const audioTrack = destination.stream.getAudioTracks()[0] || localStreamRef.current?.getAudioTracks()[0];
      const videoTrack = screenShareEnabled
        ? screenStreamRef.current?.getVideoTracks()[0]
        : localStreamRef.current?.getVideoTracks()[0];

      const broadcastStream = new MediaStream();
      if (videoTrack) broadcastStream.addTrack(videoTrack);
      if (audioTrack) broadcastStream.addTrack(audioTrack);
      activeBroadcastStreamRef.current = broadcastStream;

      const broadcaster = startHostWebRTCStream(broadcastStream);
      hostBroadcasterRef.current = broadcaster;

      return () => {
        broadcaster.stop();
        hostBroadcasterRef.current = null;
      };
    }
  }, [isAdmin, isLive]);

  // WebRTC Guest Direct Audio/Video Track Receiver (0ms Latency 30-60 FPS P2P)
  useEffect(() => {
    if (!isAdmin && isLive) {
      const stopGuestP2P = connectGuestWebRTCStream((remoteStream) => {
        setHasReceivedLiveVideo(true);
        setHostCamEnabled(true);
        if (guestVideoRef.current) {
          if (guestVideoRef.current.srcObject !== remoteStream) {
            guestVideoRef.current.srcObject = remoteStream;
          }
          guestVideoRef.current.muted = false;
          guestVideoRef.current.volume = guestVolumeRef.current;
          guestVideoRef.current.play().catch(() => {
            // If browser blocks unmuted playback on initial user gesture absence
            if (guestVideoRef.current) {
              guestVideoRef.current.muted = true;
              setIsGuestAudioMuted(true);
              guestVideoRef.current.play().catch(() => {});
            }
          });
        }
      });
      return () => {
        stopGuestP2P();
      };
    }
  }, [isAdmin, isLive]);



  const handleUnmuteGuest = () => {
    if (guestVideoRef.current) {
      guestVideoRef.current.muted = false;
      guestVideoRef.current.volume = guestVolume || 1;
      setIsGuestAudioMuted(false);
      guestVideoRef.current.play().catch(() => {});
      showToast('🔊 Đã bật âm thanh Live Stream chuẩn HD!', 'success');
    }
  };

  const handleToggleGuestMute = () => {
    if (guestVideoRef.current) {
      const nextMuted = !guestVideoRef.current.muted;
      guestVideoRef.current.muted = nextMuted;
      setIsGuestAudioMuted(nextMuted);
    }
  };

  const handleGuestVolumeChange = (newVol: number) => {
    setGuestVolume(newVol);
    if (guestVideoRef.current) {
      guestVideoRef.current.volume = newVol;
      if (newVol > 0 && guestVideoRef.current.muted) {
        guestVideoRef.current.muted = false;
        setIsGuestAudioMuted(false);
      }
    }
  };

  // Enumerate video devices for Admin
  useEffect(() => {
    if (!isAdmin) return;
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableVideoDevices(videoInputs);
        const obsDevice = videoInputs.find(d => d.label.toLowerCase().includes('obs') || d.label.toLowerCase().includes('virtual'));
        if (obsDevice && !selectedDeviceId) {
          setSelectedDeviceId(obsDevice.deviceId);
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  // WebRTC Studio Audio Constraints for Acoustic Echo Cancellation (AEC), Dereverberation & HD Voice Pickup
  const AUDIO_VOICE_CONSTRAINTS = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false, // Disable AGC to eliminate room reverberation and echo bounce
    sampleRate: 48000,
    channelCount: 1,
    googEchoCancellation: true,
    googAutoGainControl: false,
    googNoiseSuppression: true,
    googHighpassFilter: true,
    googTypingNoiseDetection: true,
    googAudioMirroring: false,
    googDereverb: true,
  };

  // --- ADMIN CAMERA & MIC STREAM INITIALIZATION WITH SIMULCAST ---
  useEffect(() => {
    if (!isAdmin || !isLive || streamSourceMode !== 'camera') return;

    const tryGetUserMedia = async () => {
      const attempts = [
        // Attempt 1: Specific device if selected
        ...(selectedDeviceId ? [{ video: { deviceId: { exact: selectedDeviceId } }, audio: AUDIO_VOICE_CONSTRAINTS }] : []),
        // Attempt 2: Standard webcam/virtual camera with HD audio
        { video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: AUDIO_VOICE_CONSTRAINTS },
        // Attempt 3: Any video input with audio constraints
        { video: true, audio: AUDIO_VOICE_CONSTRAINTS },
        // Attempt 4: Basic video/audio
        { video: true, audio: true },
        // Attempt 5: Video only
        { video: true, audio: false }
      ];

      for (const constraint of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraint);
          localStreamRef.current = stream;
          if (videoRef.current && !screenShareEnabled) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          updateHostAudioMix();
          if (hostBroadcasterRef.current && !screenShareEnabled) {
            const camTrack = stream.getVideoTracks()[0];
            if (camTrack) hostBroadcasterRef.current.replaceVideoTrack(camTrack);
          }
          liveKitManagerRef.current?.publishCameraAndMic(videoRef.current);
          return stream;
        } catch (err) {
          console.warn('Attempting next camera constraint...', err);
        }
      }
      return null;
    };

    tryGetUserMedia().then(stream => {
      if (!stream) {
        showToast('⚠️ Không tìm thấy tín hiệu Camera vật lý hoặc OBS Virtual Cam đang tắt!', 'warning');
      }
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [isAdmin, isLive, streamSourceMode, selectedDeviceId]);

  // Keep Admin Video element & PIP Video element srcObject synced whenever camera state or stream changes
  useEffect(() => {
    if (isAdmin && localStreamRef.current) {
      if (!screenShareEnabled && videoRef.current && videoRef.current.srcObject !== localStreamRef.current) {
        videoRef.current.srcObject = localStreamRef.current;
        if (cameraEnabled) videoRef.current.play().catch(() => {});
      }
      if (screenShareEnabled && screenShareVideoRef.current && screenShareVideoRef.current.srcObject !== localStreamRef.current) {
        screenShareVideoRef.current.srcObject = localStreamRef.current;
        screenShareVideoRef.current.play().catch(() => {});
      }
    }
  }, [isAdmin, cameraEnabled, screenShareEnabled, streamSourceMode]);

  // --- ADMIN LIGHTWEIGHT PREVIEW THUMBNAIL BROADCASTER VIA SUPABASE REALTIME (30 FPS RAF) ---
  useEffect(() => {
    if (!isAdmin || !isLive) return;

    // High-precision 30 FPS RAF loop via Supabase Realtime Broadcast Channels
    const isScreen = screenShareEnabled;
    const captureWidth = isScreen ? 640 : 480;
    const captureHeight = isScreen ? 360 : 270;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = captureWidth;
    offCanvas.height = captureHeight;
    const offCtx = offCanvas.getContext('2d', { alpha: false, desynchronized: true });

    let animId: number;
    let lastSendTime = 0;
    const targetInterval = 33; // 30 FPS smooth live video movement

    const renderLoop = (time: number) => {
      if (time - lastSendTime >= targetInterval) {
        if ((cameraEnabled || isScreen) && videoRef.current && videoRef.current.readyState >= 2) {
          if (offCtx) {
            offCtx.imageSmoothingEnabled = true;
            offCtx.imageSmoothingQuality = 'low';
            offCtx.drawImage(videoRef.current, 0, 0, captureWidth, captureHeight);
            const frameData = offCanvas.toDataURL('image/jpeg', 0.32);
            liveKitManagerRef.current?.sendDataMessage({
              type: 'VIDEO_FRAME',
              frame: frameData,
              t: Date.now()
            });
          }
        }
        lastSendTime = time;
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isAdmin, isLive, cameraEnabled, screenShareEnabled]);

  // Host Toggle Camera - Clean track toggle with zero black-screen lag
  const handleToggleCamera = async () => {
    if (!isAdmin) return;
    const nextState = !cameraEnabled;
    setCameraEnabled(nextState);

    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(t => {
          t.enabled = nextState;
        });
      }
      if (videoRef.current && !screenShareEnabled) {
        if (videoRef.current.srcObject !== localStreamRef.current) {
          videoRef.current.srcObject = localStreamRef.current;
        }
        if (nextState) {
          videoRef.current.play().catch(() => {});
        }
      }
    } else if (nextState) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: AUDIO_VOICE_CONSTRAINTS
        });
        localStreamRef.current = newStream;
        if (videoRef.current && !screenShareEnabled) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(() => {});
        }
        if (hostBroadcasterRef.current && !screenShareEnabled) {
          const camTrack = newStream.getVideoTracks()[0];
          if (camTrack) hostBroadcasterRef.current.replaceVideoTrack(camTrack);
        }
      } catch (err) {
        console.warn('Acquire camera error:', err);
      }
    }
    
    liveKitManagerRef.current?.sendDataMessage({ type: 'CAM_STATE', enabled: nextState });
    await liveKitManagerRef.current?.toggleCamera(nextState);
    showToast(nextState ? '🎥 Đã bật Camera phát sóng' : '🚫 Đã tắt Camera phát sóng', nextState ? 'success' : 'info');
  };

  // Host Toggle Microphone
  const handleToggleMic = async () => {
    if (!isAdmin) return;
    const nextState = !micEnabled;
    setMicEnabled(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = nextState));
    }
    updateHostAudioMix();
    await liveKitManagerRef.current?.toggleMicrophone(nextState);
    showToast(nextState ? '🎙️ Đã bật Microphone' : '🔇 Đã tắt Microphone', nextState ? 'success' : 'info');
  };

  // Host Toggle AI Neural DSP Noise Cancellation & Acoustic Dereverberation
  const handleToggleNoiseFilter = () => {
    if (!isAdmin) return;
    const nextState = !noiseFilterActive;
    setNoiseFilterActive(nextState);
    updateHostAudioMix();
    showToast(
      nextState
        ? '🤖 Đã KÍCH HOẠT AI DEREVERB & AEC: Khử Tiếng Vọng Phòng + Lọc Tạp Âm Cực Đại!'
        : '🔉 Đã TẮT Khử Vang & Lọc Tạp Âm AI',
      'info'
    );
  };

  // Host Toggle Screen Share with 60 FPS Video & High Fidelity System Audio
  const handleToggleScreenShare = async () => {
    if (!isAdmin) return;
    try {
      if (!screenShareEnabled) {
        // Multi-device adaptive display media capture (Smooth 30-60 FPS, 1080p, ultra-sharp detail)
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 60, min: 30 },
            displaySurface: 'monitor',
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 2,
            sampleRate: 48000,
          },
        });

        screenStreamRef.current = screenStream;
        setScreenShareEnabled(true);

        const screenVideoTrack = screenStream.getVideoTracks()[0];
        if (screenVideoTrack && 'contentHint' in screenVideoTrack) {
          // 'detail' instructs WebRTC hardware encoders to preserve pin-sharp text, UI, and slides without compression blurring
          screenVideoTrack.contentHint = 'detail';
        }

        // 1. Instant 60 FPS zero-latency track replacement for all WebRTC viewers
        if (hostBroadcasterRef.current && screenVideoTrack) {
          await hostBroadcasterRef.current.replaceVideoTrack(screenVideoTrack);
        }

        // 2. Mix in system audio from screen presentation
        updateHostAudioMix();

        // 3. Update host local preview video
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
          videoRef.current.play().catch(() => {});
        }

        // 4. In PiP window, show the host camera
        if (screenShareVideoRef.current && localStreamRef.current) {
          screenShareVideoRef.current.srcObject = localStreamRef.current;
          screenShareVideoRef.current.play().catch(() => {});
        }

        await liveKitManagerRef.current?.toggleScreenShare(true);

        const stopHandler = async () => {
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
          }
          setScreenShareEnabled(false);

          // Revert video track back to camera with 'motion' content hint
          const camTrack = localStreamRef.current?.getVideoTracks()[0] || null;
          if (camTrack && 'contentHint' in camTrack) {
            camTrack.contentHint = 'motion';
          }
          if (hostBroadcasterRef.current && camTrack) {
            await hostBroadcasterRef.current.replaceVideoTrack(camTrack);
          }

          // Revert audio back to mic-only
          updateHostAudioMix();

          if (localStreamRef.current && videoRef.current) {
            videoRef.current.srcObject = localStreamRef.current;
            videoRef.current.play().catch(() => {});
          }
          liveKitManagerRef.current?.toggleScreenShare(false);
          showToast('💻 Đã dừng chia sẻ màn hình', 'info');
        };

        if (screenVideoTrack) {
          screenVideoTrack.onended = stopHandler;
        }

        const hasAudio = screenStream.getAudioTracks().length > 0;
        showToast(
          hasAudio
            ? '💻 Đã chia sẻ màn hình 60 FPS CÓ ÂM THANH hệ thống cực nét, không delay!'
            : '💻 Đã chia sẻ màn hình 60 FPS mượt mà!',
          'success'
        );
      } else {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
        }
        setScreenShareEnabled(false);

        const camTrack = localStreamRef.current?.getVideoTracks()[0] || null;
        if (hostBroadcasterRef.current && camTrack) {
          await hostBroadcasterRef.current.replaceVideoTrack(camTrack);
        }
        updateHostAudioMix();

        if (localStreamRef.current && videoRef.current) {
          videoRef.current.srcObject = localStreamRef.current;
          videoRef.current.play().catch(() => {});
        }
        await liveKitManagerRef.current?.toggleScreenShare(false);
        showToast('💻 Đã dừng chia sẻ màn hình', 'info');
      }
    } catch (err) {
      console.warn('Screen share error or cancelled:', err);
    }
  };

  // Admin Start Live Stream (Broadcasts instantly to all devices on Vercel)
  const handleStartLive = async () => {
    setIsLive(true);
    await publishLiveStateToCloud(true, streamTitle, pinnedProduct?.id);
    liveKitManagerRef.current?.sendDataMessage({ type: 'LIVE_STATE', isLive: true, title: streamTitle });
    showToast('🔴 ĐÃ PHÁT SÓNG TRỰC TIẾP THÀNH CÔNG! PHÒNG LIVE ĐÃ MỞ CHO TOÀN BỘ KHÁCH HÀNG.', 'success');
  };

  // Auto-close live when Admin closes the web (tab closed / browser closed / window closed)
  useEffect(() => {
    if (!isAdmin || !isLive) return;

    // Send heartbeat to cloud every 3 seconds to guarantee live is kept active
    const heartbeatInterval = setInterval(() => {
      sendHostHeartbeat(streamTitle);
    }, 3000);

    const handleWebClose = () => {
      sendEndLiveBeacon(streamTitle);
    };

    window.addEventListener('beforeunload', handleWebClose);
    window.addEventListener('pagehide', handleWebClose);
    window.addEventListener('unload', handleWebClose);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleWebClose);
      window.removeEventListener('pagehide', handleWebClose);
      window.removeEventListener('unload', handleWebClose);
    };
  }, [isAdmin, isLive, streamTitle]);

  // Admin End Live Stream
  const handleEndLive = async () => {
    setIsLive(false);

    // Stop local media tracks immediately so camera and mic hardware turn off
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Publish end state immediately to Cloud, LiveKit and BroadcastChannel
    await publishLiveStateToCloud(false, streamTitle);
    liveKitManagerRef.current?.sendDataMessage({ type: 'LIVE_STATE', isLive: false });
    showToast('⏹️ Đã kết thúc phiên Live Stream và tự động đóng phòng trực tiếp thành công.', 'info');
    if (onCloseLive) onCloseLive();
  };

  // Admin Kick Viewer
  const handleKickViewer = (viewerId: string, viewerName: string) => {
    if (!isAdmin) return;
    fetch('/api/live/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: viewerId }),
    }).catch(() => {});

    liveKitManagerRef.current?.sendDataMessage({
      type: 'KICK_VIEWER',
      targetUserId: viewerId,
    });
    setParticipants(prev => prev.filter(p => p.id !== viewerId));
    showToast(`🚫 Đã mời người xem ${viewerName} khỏi phòng Live!`, 'warning');
  };

  // Admin Pin Product
  const handlePinProduct = (product: Product) => {
    if (!isAdmin) return;
    setPinnedProduct(product);
    setIsPinModalOpen(false);
    liveKitManagerRef.current?.sendDataMessage({
      type: 'PIN_PRODUCT',
      product,
    });
    showToast(`📌 Đã ghim sản phẩm: ${product.name}`, 'success');
  };

  // Send Chat Message with support for Link, Image, File (STRICTLY prevents window scrolling to footer)
  const handleSendMessage = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!inputMessage.trim() && !attachedImage && !attachedFile) return;

    // 1. Lock exact window scroll position to prevent any jump to footer
    const savedWindowScrollY = window.scrollY;

    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderBadge: isAdmin ? '👑 HOST / QUẢN LÝ' : '⭐ THÀNH VIÊN',
      isAdmin,
      text: inputMessage.trim(),
      image: attachedImage || undefined,
      file: attachedFile || undefined,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    liveKitManagerRef.current?.sendDataMessage({
      type: 'CHAT',
      message: newMsg,
    });

    setInputMessage('');
    setAttachedImage(null);
    setAttachedFile(null);

    // 2. Scroll internal chat container ONLY
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }

    // 3. Keep focus on input without scrolling the window
    if (chatInputRef.current) {
      chatInputRef.current.focus({ preventScroll: true });
    }

    // 4. Enforce window scroll position remains identical (never scroll to footer)
    requestAnimationFrame(() => {
      if (window.scrollY !== savedWindowScrollY) {
        window.scrollTo({ top: savedWindowScrollY, behavior: 'instant' as ScrollBehavior });
      }
    });
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Kích thước ảnh không được vượt quá 8MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
      showToast('📸 Đã đính kèm hình ảnh!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast('Kích thước file không được vượt quá 15MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: file.size,
        url: event.target?.result as string,
        type: file.type || 'application/octet-stream',
      });
      showToast(`📄 Đã đính kèm file: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Reaction Hearts Floating Effect (Single Red Heart per click, floating straight up and fading away)
  const triggerHeartAnimation = (xPercent?: number) => {
    const heartId = `heart-${Date.now()}-${Math.random()}`;
    const redColor = '#EF4444';
    const randomX = xPercent !== undefined ? xPercent : Math.random() * 60 + 20;

    setFloatingHearts(prev => [...prev, { id: heartId, x: randomX, color: redColor }]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
    }, 2400);
  };

  const handleSendHeart = () => {
    triggerHeartAnimation();
    liveKitManagerRef.current?.sendDataMessage({
      type: 'HEART',
      x: Math.random() * 75 + 10,
    });
  };

  // Helper function to convert links in text into clickable <a> tags
  const renderMessageTextWithLinks = (text?: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00F2FE] hover:text-[#05FFD2] underline underline-offset-2 font-bold inline-flex items-center gap-1 hover:brightness-125 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{part}</span>
            <i className="fa-solid fa-[#00F2FE] fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`📋 Đã sao chép ${label} vào bộ nhớ tạm!`, 'success');
  };

  // CASE 1: IF VIEWER IS KICKED
  if (isKicked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#0A0F1D]/95 border-2 border-rose-500/80 p-8 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.4)] backdrop-blur-xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 border border-rose-500/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
            <i className="fa-solid fa-ban"></i>
          </div>
          <h2 className="text-xl font-black text-rose-400 uppercase tracking-wider mb-2">
            BẠN ĐÃ BỊ MỜI RA KHỎI PHIÊN LIVE STREAM!
          </h2>
          <p className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-6">
            BẠN ĐÃ BỊ QUẢN LÝ (ADMIN DANH NGUYỄN) MỜI RA KHỎI PHIÊN LIVE STREAM! VUI LÒNG QUAY VỀ TRANG CHỦ MUA SẮM HOẶC LIÊN HỆ STORE ĐỂ ĐƯỢC HỖ TRỢ.
          </p>
          <button
            onClick={() => {
              if (onCloseLive) onCloseLive();
              else window.location.href = '/';
            }}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-black py-3.5 rounded-full text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
          >
            QUAY VỀ TRANG CHỦ MUA SẮM
          </button>
        </div>
      </div>
    );
  }

  // CASE 2: IF ADMIN HAS NOT STARTED LIVE YET (WEB KHÁCH / GUEST SIDE)
  if (!isLive && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="max-w-xl w-full bg-[#0A0F1D]/95 border-2 border-[#00F2FE]/60 p-8 sm:p-12 rounded-3xl shadow-[0_0_60px_rgba(0,242,254,0.35)] backdrop-blur-2xl relative overflow-hidden">
          {/* Decorative Background Pulse */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[#00F2FE]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-24 h-24 rounded-3xl border-2 border-[#00F2FE] bg-[#050914] flex items-center justify-center text-4xl text-[#00F2FE] shadow-[0_0_35px_rgba(0,242,254,0.6)] mx-auto mb-6 relative">
            <i className="fa-solid fa-tower-cell animate-pulse"></i>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-black"></span>
            </span>
          </div>

          <span className="inline-block px-4 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            🔴 TRẠNG THÁI PHÒNG LIVE
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider mb-4 drop-shadow-[0_0_20px_rgba(0,242,254,0.8)] font-serif-title">
            HIỆN KHÔNG CÓ PHÒNG LIVE
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8 max-w-md mx-auto">
            Quản lý Showroom NPTTEAMSTORE hiện chưa mở phiên phát sóng trực tiếp. Bạn vui lòng quay lại sau hoặc tham quan kho sản phẩm DX & CSM chính hãng bên dưới!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (onCloseLive) onCloseLive();
                else window.location.href = '/';
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-[#00F2FE] to-[#05FFD2] hover:brightness-110 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(0,242,254,0.6)] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-store"></i>
              <span>XEM KHO SẢN PHẨM KHUYẾN MÃI</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: IF ADMIN HAS NOT STARTED LIVE YET (ADMIN SIDE CONTROL PANEL TO START)
  if (!isLive && isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="max-w-xl w-full bg-[#0A0F1D]/95 border-2 border-amber-400/80 p-8 sm:p-12 rounded-3xl shadow-[0_0_60px_rgba(255,215,0,0.35)] backdrop-blur-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl border-2 border-[#FFD700] bg-[#050914] flex items-center justify-center text-3xl text-[#FFD700] shadow-[0_0_35px_rgba(255,215,0,0.6)] mx-auto mb-4">
            <i className="fa-solid fa-crown"></i>
          </div>

          <span className="inline-block px-4 py-1.5 bg-amber-400/20 text-[#FFD700] border border-amber-400/50 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            👑 CỔNG ĐIỀU HÀNH PHÁT SÓNG QUẢN LÝ
          </span>

          <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2 font-serif-title">
            PHÒNG LIVE ĐANG TẮT
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
            Hỗ trợ phát sóng trực tiếp qua <strong>Camera Trực Tiếp</strong> hoặc kết nối phần mềm <strong>OBS Studio</strong>.
          </p>

          {/* Mode Switcher: Camera vs OBS Studio */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setStreamSourceMode('camera')}
              className={`p-3 rounded-xl border-2 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                streamSourceMode === 'camera'
                  ? 'border-[#00F2FE] bg-[#00F2FE]/20 text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-camera"></i>
              <span>Camera Trực Tiếp</span>
            </button>
            <button
              onClick={() => {
                setStreamSourceMode('obs');
                setIsOBSModalOpen(true);
              }}
              className={`p-3 rounded-xl border-2 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                streamSourceMode === 'obs'
                  ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-tower-broadcast"></i>
              <span>OBS Studio</span>
            </button>
          </div>

          <div className="space-y-4 text-left mb-8">
            <label className="block text-xs font-bold text-slate-300 uppercase">Tiêu đề buổi Live Stream:</label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full bg-[#030508] border-2 border-slate-700 focus:border-[#FFD700] text-white px-4 py-3 rounded-xl text-xs font-bold outline-none transition shadow-inner"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartLive}
              className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-[#FFD700] hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(255,215,0,0.5)] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-tower-broadcast animate-pulse"></i>
              <span>BẮT ĐẦU PHÁT SÓNG TRỰC TIẾP (GO LIVE)</span>
            </button>

            <button
              onClick={() => setIsOBSModalOpen(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-[#FFD700] border border-[#FFD700]/60 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-sliders"></i>
              <span>Thông số kết nối OBS Studio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Live Header Banner */}
      <div className="bg-[#0A0F1D]/95 border-2 border-[#00F2FE]/60 px-5 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.25)] flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-500 text-lg shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
            <i className="fa-solid fa-tower-broadcast"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                ĐANG PHÁT LIVE
              </span>
              <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                <i className="fa-solid fa-eye"></i> {viewersCount} người xem trực tuyến
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {connectionState === 'connected' ? 'Đã kết nối' : 'Đang kết nối...'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-wide truncate max-w-xl">
              {streamTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsOBSModalOpen(true)}
                className="bg-amber-400/20 hover:bg-amber-400/30 text-[#FFD700] border border-amber-400/60 font-black px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <i className="fa-solid fa-sliders"></i> Cấu hình OBS
              </button>
              <button
                onClick={handleEndLive}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.5)] transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-stop"></i> Kế thúc Live
              </button>
            </>
          )}
          {onCloseLive && (
            <button
              onClick={onCloseLive}
              className="bg-[#121214] hover:bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i> Đóng Live
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Video Player (70%) + Chat & Viewer Sidebar (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Video Screen + Host Control Panel (8 Cols desktop) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Main Sci-Fi Video & Canvas Container */}
          <div className="relative aspect-video bg-[#030508] rounded-2xl overflow-hidden border-2 border-[#00F2FE]/50 shadow-[0_0_35px_rgba(0,242,254,0.25)] group">
            
            {/* Quality Layer Indicator Badge (Top Right) */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
              <span className="bg-black/80 backdrop-blur-md border border-[#00F2FE]/60 text-[#00F2FE] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow">
                <i className="fa-solid fa-circle text-rose-500 animate-pulse text-[8px]"></i>
                <span>Trực Tiếp HD</span>
              </span>
            </div>

            {/* ADMIN VIEW: Local Camera Preview Video (Always mounted to prevent black-screen on toggle) */}
            {isAdmin ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover relative z-10 bg-black ${
                    cameraEnabled ? 'block' : 'hidden'
                  }`}
                  onLoadedMetadata={(e) => {
                    const el = e.currentTarget;
                    el.play().catch(() => {});
                  }}
                />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030508] p-6 text-center z-20">
                    <div className="w-20 h-20 rounded-full border-2 border-[#00F2FE] bg-[#0A0F1D] flex items-center justify-center text-3xl text-[#00F2FE] shadow-[0_0_25px_rgba(0,242,254,0.5)] mb-3 animate-pulse">
                      <i className="fa-solid fa-video-slash"></i>
                    </div>
                    <h3 className="text-lg font-black text-[#E0F7FA] uppercase tracking-wider mb-1">
                      CAMERA ĐANG TẮT TẠM THỜI
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Bấm nút "Bật Cam" bên dưới hoặc đẩy luồng từ OBS Studio để tiếp tục phát hình.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST VIEW: 60 FPS Hardware-Accelerated WebRTC Video Player + Instant Canvas Fallback Layer */
              <div 
                className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer select-none overflow-hidden"
                onClick={isGuestAudioMuted ? handleUnmuteGuest : undefined}
              >
                {/* Fallback Canvas Layer (z-10): Renders instant WebSocket/Firestore snapshot frames while connecting */}
                <canvas
                  ref={guestCanvasRef}
                  width={854}
                  height={480}
                  className="absolute inset-0 w-full h-full object-contain z-10 block bg-black"
                />

                {/* Primary WebRTC 60 FPS Video Player (z-20): Hardware accelerated GPU video, transparent until playing */}
                <video
                  ref={guestVideoRef}
                  autoPlay
                  playsInline
                  className={`relative w-full h-full object-contain z-20 transition-opacity duration-200 ${
                    hasReceivedLiveVideo ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadedData={() => {
                    setHasReceivedLiveVideo(true);
                    setHostCamEnabled(true);
                  }}
                  onPlaying={() => {
                    setHasReceivedLiveVideo(true);
                    setHostCamEnabled(true);
                  }}
                />

                {/* Un-Mute Floating Interaction Prompt if Browser Blocked Audio Autoplay */}
                {isGuestAudioMuted && hasReceivedLiveVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnmuteGuest();
                    }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 text-slate-950 font-black px-5 py-2.5 rounded-full text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.85)] z-40 flex items-center gap-2 animate-bounce cursor-pointer border border-white/60"
                  >
                    <i className="fa-solid fa-volume-high text-sm"></i>
                    <span>BẤM ĐỂ BẬT TIẾNG LIVE STREAM (0MS DELAY)</span>
                  </button>
                )}

                {/* Guest Video Player Controls: Volume, Mute, Fullscreen */}
                {hasReceivedLiveVideo && (
                  <div 
                    className="absolute bottom-3 right-3 z-40 flex items-center gap-2 bg-[#050914]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleToggleGuestMute}
                      className="text-cyan-400 hover:text-cyan-300 text-xs p-1 cursor-pointer transition"
                      title={isGuestAudioMuted || guestVolume === 0 ? 'Bật âm thanh' : 'Tắt âm thanh'}
                    >
                      <i className={`fa-solid ${isGuestAudioMuted || guestVolume === 0 ? 'fa-volume-xmark text-rose-400' : 'fa-volume-high'}`}></i>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isGuestAudioMuted ? 0 : guestVolume}
                      onChange={(e) => handleGuestVolumeChange(parseFloat(e.target.value))}
                      className="w-16 h-1 accent-cyan-400 cursor-pointer"
                      title={`Âm lượng: ${Math.round((isGuestAudioMuted ? 0 : guestVolume) * 100)}%`}
                    />
                    <button
                      onClick={() => {
                        const container = guestVideoRef.current?.parentElement;
                        if (container) {
                          if (!document.fullscreenElement) {
                            container.requestFullscreen?.().catch(() => {});
                          } else {
                            document.exitFullscreen?.().catch(() => {});
                          }
                        }
                      }}
                      className="text-slate-300 hover:text-white text-xs p-1 ml-1 cursor-pointer transition"
                      title="Xem toàn màn hình"
                    >
                      <i className="fa-solid fa-expand"></i>
                    </button>
                  </div>
                )}

                {!hasReceivedLiveVideo && (
                  <div className="absolute inset-0 bg-[#050914] flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                    <div className="w-16 h-16 rounded-full border-2 border-[#00F2FE] flex items-center justify-center text-2xl text-[#00F2FE] animate-spin mb-3">
                      <i className="fa-solid fa-rotate"></i>
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      ĐANG KẾT NỐI CAMERA & MÀN HÌNH TRỰC TIẾP...
                    </h4>
                  </div>
                )}
              </div>
            )}

            {/* Floating Screen Share Sub-window (Picture in Picture) */}
            {screenShareEnabled && (
              <div className="absolute top-4 right-4 w-44 sm:w-56 aspect-video bg-black/90 border-2 border-[#05FFD2] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(5,255,210,0.6)] z-30">
                <video
                  ref={screenShareVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-black/80 text-[#05FFD2] text-[9px] font-bold px-1.5 py-0.5 rounded">
                  💻 Màn Hình Chia Sẻ
                </span>
              </div>
            )}

            {/* Real-time Floating Hearts Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
              {floatingHearts.map((heart) => (
                <div
                  key={heart.id}
                  className="absolute bottom-6 text-2xl sm:text-3xl animate-float-up-straight pointer-events-none"
                  style={{
                    left: `${heart.x}%`,
                    color: heart.color || '#EF4444',
                    filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))',
                  }}
                >
                  <i className="fa-solid fa-heart"></i>
                </div>
              ))}
            </div>

            {/* Pinned Product Floating Overlay Card (Bottom Left of Video) */}
            {pinnedProduct && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-[#0A0F1D]/95 border-2 border-[#FFD700] p-2.5 rounded-xl shadow-[0_0_25px_rgba(255,215,0,0.4)] backdrop-blur-xl z-30 flex items-center gap-3">
                <img
                  src={pinnedProduct.images[0]}
                  alt={pinnedProduct.name}
                  className="w-14 h-14 object-contain rounded-lg bg-black/60 p-1 border border-[#FFD700]/40 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                  }}
                />
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="bg-[#FFD700] text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                      📌 ĐANG GHIM LIVE
                    </span>
                    <span className="text-[10px] text-cyan-300 font-semibold truncate">
                      {pinnedProduct.series}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{pinnedProduct.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-[#FFD700]">
                      {pinnedProduct.price.toLocaleString('vi-VN')}đ
                    </span>
                    {pinnedProduct.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {pinnedProduct.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => onBuyNow(pinnedProduct)}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                  >
                    MUA NGAY
                  </button>
                  <button
                    onClick={() => onSelectProduct(pinnedProduct)}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Live Controls Toolbar (CHỈ QUẢN LÝ MỚI CÓ THANH NÀY) */}
          {isAdmin ? (
            <div className="bg-[#0A0F1D]/95 border-2 border-[#00F2FE]/60 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,242,254,0.2)] flex flex-wrap items-center justify-between gap-2.5 backdrop-blur-xl">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Toggle Camera */}
                <button
                  onClick={handleToggleCamera}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
                    cameraEnabled
                      ? 'bg-cyan-500/20 text-[#00F2FE] border border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-600'
                  }`}
                  title={cameraEnabled ? 'Tắt Camera' : 'Bật Camera'}
                >
                  <i className={`fa-solid ${cameraEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
                  <span>{cameraEnabled ? 'TẮT CAM' : 'BẬT CAM'}</span>
                </button>

                {/* Toggle Mic */}
                <button
                  onClick={handleToggleMic}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
                    micEnabled
                      ? 'bg-cyan-500/20 text-[#00F2FE] border border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-600'
                  }`}
                  title={micEnabled ? 'Tắt Microphone' : 'Bật Microphone'}
                >
                  <i className={`fa-solid ${micEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                  <span>{micEnabled ? 'TẮT MIC' : 'BẬT MIC'}</span>
                </button>

                {/* AI Dereverberation, AEC & Noise Suppression (Khử Vang, Vọng Phòng & Tạp Âm Mic) */}
                <button
                  onClick={handleToggleNoiseFilter}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
                    noiseFilterActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Studio DSP: Triệt tiêu hoàn toàn tiếng vang dội phòng, tường rỗng & chống feedback vọng mic"
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-emerald-400"></i>
                  <span>AI KHỬ VANG & CHỐNG VỌNG: {noiseFilterActive ? 'BẬT (STUDIO)' : 'TẮT'}</span>
                </button>

                {/* Screen Share as Live Source */}
                <button
                  onClick={handleToggleScreenShare}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
                    screenShareEnabled
                      ? 'bg-[#05FFD2] text-slate-950 shadow-[0_0_15px_rgba(5,255,210,0.5)]'
                      : 'bg-[#05FFD2]/20 text-[#05FFD2] border border-[#05FFD2] hover:bg-[#05FFD2]/30'
                  }`}
                  title="Chia sẻ toàn màn hình hoặc cửa sổ OBS vào Live"
                >
                  <i className="fa-solid fa-desktop"></i>
                  <span>{screenShareEnabled ? 'DỪNG PHÁT MÀN HÌNH' : 'PHÁT MÀN HÌNH (SHARE SCREEN)'}</span>
                </button>

                {/* Camera Device Selector Dropdown */}
                {availableVideoDevices.length > 0 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => {
                      setSelectedDeviceId(e.target.value);
                      setStreamSourceMode('camera');
                    }}
                    className="bg-slate-900 border border-cyan-500/50 text-cyan-300 px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    title="Chọn nguồn camera (Webcam hoặc OBS Virtual Camera)"
                  >
                    <option value="">🎥 Mặc định (Webcam)</option>
                    {availableVideoDevices.map(dev => (
                      <option key={dev.deviceId} value={dev.deviceId}>
                        📹 {dev.label || `Camera ${dev.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOBSModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-[#FFD700] border border-[#FFD700]/50 font-bold px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-sliders"></i> Cài Đặt OBS
                </button>

                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.4)] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-thumbtack"></i> GHIM SP
                </button>
              </div>
            </div>
          ) : (
            /* GUEST INTERACTION BAR (LIKE HEARTS) */
            <div className="bg-[#0A0F1D]/95 border-2 border-[#00F2FE]/60 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,242,254,0.2)] flex items-center justify-between gap-3 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs text-slate-300 font-bold">Thả tim tương tác cùng buổi phát trực tiếp!</span>
              </div>
              <button
                onClick={handleSendHeart}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:scale-105 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] transition duration-200 cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <i className="fa-solid fa-heart animate-bounce text-sm"></i>
                <span>THẢ TIM (LIKE) ❤️</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Chat, Viewers, & Pinned Products Tab Sidebar (4 Cols desktop) */}
        <div className="lg:col-span-4 bg-[#0A0F1D]/95 border-2 border-[#00F2FE]/60 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.2)] flex flex-col h-[650px] backdrop-blur-xl overflow-hidden">
          {/* Sidebar Tab Navigation Header */}
          <div className="grid grid-cols-3 border-b-2 border-slate-800 bg-[#030508]/80 text-xs font-black">
            <button
              onClick={() => setChatTab('chat')}
              className={`py-3 text-center transition cursor-pointer ${
                chatTab === 'chat'
                  ? 'text-[#00F2FE] border-b-2 border-[#00F2FE] bg-[#00F2FE]/10 shadow-[inset_0_-2px_10px_rgba(0,242,254,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💬 BÌNH LUẬN ({messages.length})
            </button>
            <button
              onClick={() => setChatTab('viewers')}
              className={`py-3 text-center transition cursor-pointer ${
                chatTab === 'viewers'
                  ? 'text-[#00F2FE] border-b-2 border-[#00F2FE] bg-[#00F2FE]/10 shadow-[inset_0_-2px_10px_rgba(0,242,254,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👥 NGƯỜI XEM ({participants.length})
            </button>
            <button
              onClick={() => setChatTab('products')}
              className={`py-3 text-center transition cursor-pointer ${
                chatTab === 'products'
                  ? 'text-[#00F2FE] border-b-2 border-[#00F2FE] bg-[#00F2FE]/10 shadow-[inset_0_-2px_10px_rgba(0,242,254,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛍️ SẢN PHẨM
            </button>
          </div>

          {/* TAB 1: LIVE CHAT MESSAGES & ATTACHMENTS (LINK, IMAGE, FILE) */}
          {chatTab === 'chat' && (
            <div className="flex-grow flex flex-col min-h-0">
              {/* Message History Feed */}
              <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-3.5 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border transition text-xs ${
                      msg.isAdmin
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${msg.isAdmin ? 'text-[#FFD700]' : 'text-cyan-300'}`}>
                          {msg.senderName}
                        </span>
                        {msg.senderBadge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            msg.isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {msg.senderBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Text content with clickable links */}
                    {msg.text && (
                      <p className="text-slate-200 leading-relaxed break-words mt-1">
                        {renderMessageTextWithLinks(msg.text)}
                      </p>
                    )}

                    {/* Attached Image with click to view in Lightbox */}
                    {msg.image && (
                      <div className="mt-2.5">
                        <img
                          src={msg.image}
                          alt="Attached"
                          className="max-h-36 rounded-lg border border-cyan-500/40 object-cover cursor-pointer hover:brightness-110 transition shadow"
                          onClick={() => setSelectedImageLightbox(msg.image || null)}
                        />
                        <span className="text-[9px] text-cyan-400 italic block mt-1">Bấm vào ảnh để phóng to</span>
                      </div>
                    )}

                    {/* Attached File with download button */}
                    {msg.file && (
                      <div className="mt-2.5 bg-[#030508] border border-cyan-500/40 p-2.5 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-[#00F2FE] flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-file-arrow-down text-sm"></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{msg.file.name}</p>
                            <span className="text-[10px] text-slate-400">
                              {(msg.file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <a
                          href={msg.file.url}
                          download={msg.file.name}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-[10px] uppercase transition shrink-0 shadow flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-download"></i> Tải file
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar with Image & File Attachments */}
              <div className="p-3 border-t-2 border-slate-800 bg-[#030508]/90 space-y-2">
                {/* Preview attached image or file before sending */}
                {attachedImage && (
                  <div className="flex items-center justify-between bg-slate-900 border border-cyan-500/40 p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <img src={attachedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                      <span className="text-xs text-cyan-300 font-bold">Đã đính kèm ảnh</span>
                    </div>
                    <button
                      onClick={() => setAttachedImage(null)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}

                {attachedFile && (
                  <div className="flex items-center justify-between bg-slate-900 border border-cyan-500/40 p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-file text-[#00F2FE]"></i>
                      <span className="text-xs text-cyan-300 font-bold truncate max-w-[180px]">{attachedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}

                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleSendMessage(e); 
                  }} 
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Upload Image Button */}
                    <label className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center cursor-pointer transition shadow" title="Gửi ảnh">
                      <i className="fa-solid fa-image text-xs"></i>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    {/* Upload File Button */}
                    <label className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center cursor-pointer transition shadow" title="Gửi file tài liệu">
                      <i className="fa-solid fa-paperclip text-xs"></i>
                      <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  <input
                    ref={chatInputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Nhập bình luận, dán link..."
                    className="flex-grow bg-[#0A0F1D] border border-slate-700 focus:border-[#00F2FE] text-white px-3 py-2 rounded-xl text-xs outline-none transition"
                  />

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage(e);
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition shadow cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
                  >
                    <span>Gửi</span>
                    <i className="fa-solid fa-paper-plane text-[10px]"></i>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS / VIEWERS LIST (100% REAL ACCOUNTS ONLY) */}
          {chatTab === 'viewers' && (
            <div className="flex-grow overflow-y-auto p-3.5 space-y-2.5">
              {/* Real Connection Status Banner */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Khán giả đang theo dõi
                    </h4>
                    <p className="text-[10.5px] text-slate-400">
                      Danh sách người xem có mặt trong phòng
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetch('/api/live/viewers')
                        .then(r => r.json())
                        .then(d => {
                          if (d && Array.isArray(d.viewers)) {
                            setParticipants(d.viewers);
                            setViewersCount(d.viewers.length > 0 ? d.viewers.length : 1);
                            showToast('🔄 Đã làm mới danh sách người xem thật', 'info');
                          }
                        })
                        .catch(() => {});
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition cursor-pointer"
                    title="Làm mới danh sách"
                  >
                    <i className="fa-solid fa-arrows-rotate"></i>
                  </button>
                  <span className="bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/40 px-2 py-0.5 rounded-full text-xs font-black">
                    {participants.length} người
                  </span>
                </div>
              </div>

              {/* Guest Login Suggestion Banner if not logged in */}
              {!currentUser && !isAdmin && onOpenAuth && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-200 text-xs">
                    <i className="fa-solid fa-circle-user text-amber-400 text-base"></i>
                    <div>
                      <p className="font-bold">Bạn đang xem với tư cách Khách ghé thăm</p>
                      <p className="text-[10.5px] text-amber-300/80">Đăng nhập tài khoản để hiện họ tên thật của bạn</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenAuth}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-lg text-[11px] uppercase transition cursor-pointer shrink-0 shadow"
                  >
                    Đăng Nhập
                  </button>
                </div>
              )}

              {participants.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <i className="fa-solid fa-users text-2xl mb-2 block opacity-40"></i>
                  Đang đồng bộ người xem từ máy chủ...
                </div>
              ) : (
                participants.map((viewer) => {
                  const isCurrent = viewer.id === currentUserId;
                  return (
                    <div
                      key={viewer.id}
                      className={`p-3 rounded-xl flex items-center justify-between gap-2.5 transition border ${
                        viewer.isAdmin
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : isCurrent
                          ? 'bg-cyan-950/30 border-cyan-500/40'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 relative ${
                          viewer.isAdmin
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                            : viewer.isRegisteredCustomer
                            ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {viewer.isAdmin ? (
                            <i className="fa-solid fa-crown"></i>
                          ) : viewer.isRegisteredCustomer ? (
                            viewer.name.slice(0, 2).toUpperCase()
                          ) : (
                            <i className="fa-solid fa-user"></i>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-white truncate">{viewer.name}</h4>
                            {isCurrent && (
                              <span className="bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                Bạn
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className={viewer.isAdmin ? 'text-amber-400 font-bold' : viewer.isRegisteredCustomer ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                              {viewer.roleBadge || (viewer.isAdmin ? '👑 Quản Lý Showroom' : viewer.isRegisteredCustomer ? '⭐ Thành Viên Đã Đăng Ký' : '👤 Khách Trực Tuyến')}
                            </span>
                            {viewer.joinedAt && (
                              <>
                                <span>•</span>
                                <span>{viewer.joinedAt}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Online
                        </span>

                        {isAdmin && !viewer.isAdmin && !isCurrent && (
                          <button
                            onClick={() => handleKickViewer(viewer.id, viewer.name)}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer shadow"
                            title="Mời người xem này ra khỏi phòng live"
                          >
                            <i className="fa-solid fa-user-slash mr-1"></i> Mời ra
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS STORE CATALOG FOR LIVE */}
          {chatTab === 'products' && (
            <div className="flex-grow overflow-y-auto p-3.5 space-y-2.5">
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl mb-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-bold">Danh mục sản phẩm Live Store</span>
                {isAdmin && (
                  <button
                    onClick={() => setIsPinModalOpen(true)}
                    className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase shadow"
                  >
                    Ghim sản phẩm
                  </button>
                )}
              </div>

              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-[#FFD700] p-2.5 rounded-xl flex items-center gap-3 transition group cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 object-contain rounded-lg bg-black/60 p-1 border border-slate-700 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/Ảnh Sản Phẩm/dx/Kamen Rider Zeztz DX Henshin Belt Lord Invoker1.jpg';
                    }}
                  />
                  <div className="min-w-0 flex-grow">
                    <span className="text-[9px] text-[#00F2FE] font-bold uppercase">{product.series}</span>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FFD700] transition">
                      {product.name}
                    </h4>
                    <span className="text-xs font-black text-[#FFD700]">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuyNow(product);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] uppercase shadow"
                    >
                      Mua ngay
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinProduct(product);
                        }}
                        className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/50 font-bold px-2 py-0.5 rounded-lg text-[9px]"
                      >
                        Ghim live
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OBS STUDIO CONFIGURATION MODAL FOR ADMIN */}
      {isOBSModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border-2 border-[#FFD700] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(255,215,0,0.4)] max-h-[90vh] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-[#FFD700] border border-[#FFD700]/50 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-tower-broadcast"></i>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#FFD700] uppercase tracking-wider">
                    Cấu Hình Kết Nối OBS Studio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Thông số kết nối phần mềm phát sóng trực tiếp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOBSModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80 cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Method 1: Virtual Camera */}
              <div className="bg-[#050914] border-2 border-emerald-500/60 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-camera"></i> CÁCH 1: SỬ DỤNG MÁY QUAY ẢO (VIRTUAL CAMERA)
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  1. Trong OBS Studio, bấm nút <strong>Bắt đầu máy quay ảo (Start Virtual Camera)</strong>.<br />
                  2. Tại giao diện quản lý trên web, chọn <strong>Camera Trực Tiếp</strong> rồi bấm <strong>GO LIVE</strong>.<br />
                  3. Hình ảnh và âm thanh từ OBS Studio sẽ được truyền trực tiếp lên phòng phát sóng.
                </p>
              </div>

              {/* Method 2: Direct Stream */}
              <div className="bg-slate-900 border-2 border-[#00F2FE]/50 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-bolt"></i> CÁCH 2: KẾT NỐI LUỒNG TRỰC TIẾP
                  </span>
                </div>
                <p className="text-slate-300">
                  Trong OBS: Vào <strong>Thiết đặt (Settings) &gt; Luồng (Stream)</strong>:
                </p>

                <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Địa chỉ máy chủ (Server URL):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={obsConfig?.whipUrl || 'https://live.nptteamstore.vn/stream'}
                          className="flex-grow bg-[#050914] border border-slate-700 px-3 py-2 rounded-xl text-white font-mono text-[11px]"
                        />
                        <button
                          onClick={() => copyToClipboard(obsConfig?.whipUrl || 'https://live.nptteamstore.vn/stream', 'Địa chỉ máy chủ')}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs uppercase"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-bold">Khóa xác thực luồng (Token):</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          readOnly
                          value={obsConfig?.bearerToken || 'npt_live_stream_key_2026'}
                          className="flex-grow bg-[#050914] border border-slate-700 px-3 py-2 rounded-xl text-white font-mono text-[11px]"
                        />
                        <button
                          onClick={() => copyToClipboard(obsConfig?.bearerToken || 'npt_live_stream_key_2026', 'Khóa xác thực luồng')}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs uppercase"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method 3: Custom Server */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                  <span className="font-black text-[#FFD700] uppercase tracking-wider block">
                    CÁCH 3: TÙY CHỌN MÁY CHỦ PHÁT SÓNG
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    Trong OBS: Dịch vụ chọn <strong>Tùy chỉnh (Custom)</strong>:
                  </p>
                  <div>
                    <label className="text-slate-400 block mb-1 font-bold">Máy chủ (Server):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={obsConfig?.rtmpServer || 'https://live.nptteamstore.vn/ingest'}
                        className="flex-grow bg-[#050914] border border-slate-700 px-3 py-2 rounded-xl text-white font-mono text-[11px]"
                      />
                      <button
                        onClick={() => copyToClipboard(obsConfig?.rtmpServer || 'https://live.nptteamstore.vn/ingest', 'Máy chủ')}
                        className="bg-slate-800 hover:bg-slate-700 text-[#FFD700] font-black px-3 py-2 rounded-xl text-xs uppercase"
                      >
                        Sao chép
                      </button>
                    </div>
                  </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-bold">Khóa luồng (Stream Key):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      readOnly
                      value={obsConfig?.streamKey || 'npt-live-stream-key'}
                      className="flex-grow bg-[#050914] border border-slate-700 px-3 py-2 rounded-xl text-white font-mono text-[11px]"
                    />
                    <button
                      onClick={() => copyToClipboard(obsConfig?.streamKey || 'npt-live-stream-key', 'Khóa luồng Stream Key')}
                      className="bg-slate-800 hover:bg-slate-700 text-[#FFD700] font-black px-3 py-2 rounded-xl text-xs uppercase"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsOBSModalOpen(false)}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs shadow-lg cursor-pointer"
              >
                Đã Lưu Thông Số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR VIEWING ATTACHED IMAGES */}
      {selectedImageLightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImageLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImageLightbox(null)}
              className="absolute -top-10 right-0 bg-rose-600 hover:bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img
              src={selectedImageLightbox}
              alt="Lightbox Fullsize"
              className="max-w-full max-h-[85vh] rounded-2xl border-2 border-[#00F2FE] shadow-[0_0_50px_rgba(0,242,254,0.5)] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* PIN PRODUCT MODAL FOR ADMIN */}
      {isPinModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border-2 border-[#FFD700] rounded-3xl p-6 max-w-xl w-full shadow-[0_0_50px_rgba(255,215,0,0.4)] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-thumbtack"></i> Chọn sản phẩm ghim lên Live
              </h3>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/80 cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2.5 pr-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handlePinProduct(product)}
                  className="bg-slate-900 border border-slate-800 hover:border-[#FFD700] p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-contain bg-black/60 rounded-xl p-1 border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FFD700]">{product.name}</h4>
                      <span className="text-xs font-black text-[#FFD700]">{product.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                  <button className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase shadow shrink-0">
                    Ghim ngay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
