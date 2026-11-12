import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase Configuration for High-Speed Realtime Broadcast
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://pub-realtime-nptstore.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Yi1yZWFsdGltZS1ucHRzdG9yZSIsInJvbGUiOiJhb24iLCJpYXQiOjE2MDA0OTYwMDAsImV4cCI6MjAwMDAwMDAwMH0.supabase_public_anon_key_2026';

export interface SupabaseViewerInfo {
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

// Global BroadcastChannel for same-device cross-tab zero-latency relay
const crossTabChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('npt_supabase_realtime_relay') : null;

// Global fallback WS for local environment reliability
let globalWsFallback: WebSocket | null = null;

export class SupabaseRealtimeManager {
  private client: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private roomName: string = 'npt-live-room';
  private userId: string = '';
  private userName: string = '';
  private isHost: boolean = false;
  private userEmail: string = '';
  private isRegisteredCustomer: boolean = false;
  private isConnected: boolean = false;

  private onDataReceivedCallback?: (payload: any) => void;
  private onParticipantListChangedCallback?: (participants: SupabaseViewerInfo[]) => void;
  private onConnectionStateChangeCallback?: (state: string) => void;

  constructor() {
    this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 60 // 60 FPS events per second capability for smooth video motion
        }
      }
    });
  }

  /**
   * Connect to Supabase Realtime Channel for live stream broadcast & presence
   */
  public setupSupabaseRealtime(
    roomName = 'npt-live-room',
    user?: { id: string; name: string; isAdmin: boolean; email?: string; isRegisteredCustomer?: boolean },
    callbacks?: {
      onDataReceived?: (payload: any) => void;
      onParticipantListChanged?: (participants: SupabaseViewerInfo[]) => void;
      onConnectionStateChange?: (state: string) => void;
    }
  ) {
    this.roomName = roomName;
    if (user) {
      this.userId = user.id;
      this.userName = user.name;
      this.isHost = user.isAdmin;
      this.userEmail = user.email || '';
      this.isRegisteredCustomer = Boolean(user.isRegisteredCustomer);
    }

    if (callbacks) {
      if (callbacks.onDataReceived) this.onDataReceivedCallback = callbacks.onDataReceived;
      if (callbacks.onParticipantListChanged) this.onParticipantListChangedCallback = callbacks.onParticipantListChanged;
      if (callbacks.onConnectionStateChange) this.onConnectionStateChangeCallback = callbacks.onConnectionStateChange;
    }

    this.onConnectionStateChangeCallback?.('connecting');

    // Remove existing channel if any
    if (this.channel) {
      try { this.client.removeChannel(this.channel); } catch {}
    }

    // 1. Create Supabase Realtime Channel
    const channel = this.client.channel(this.roomName, {
      config: {
        broadcast: {
          self: false,
          ack: false
        },
        presence: {
          key: this.userId || `user_${Math.floor(Math.random() * 10000)}`
        }
      }
    });

    this.channel = channel;

    // 2. Listen to Supabase Broadcast Events
    channel.on('broadcast', { event: 'live_stream' }, (payload) => {
      if (payload && payload.payload) {
        this.onDataReceivedCallback?.(payload.payload);
      }
    });

    // 3. Listen to Supabase Realtime Presence Updates (100% Real-Time Viewers Tracking)
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const viewers: SupabaseViewerInfo[] = [];

      Object.values(presenceState).forEach((presences: any) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: any) => {
            if (p && p.id) {
              viewers.push({
                id: p.id,
                name: p.name || 'Khách Hàng',
                isAdmin: Boolean(p.isAdmin),
                isRegisteredCustomer: Boolean(p.isRegisteredCustomer),
                email: p.email || '',
                joinedAt: p.joinedAt || new Date().toISOString(),
                isOnline: true
              });
            }
          });
        }
      });

      this.onParticipantListChangedCallback?.(viewers);
    });

    // 4. Subscribe to Supabase Channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        this.isConnected = true;
        this.onConnectionStateChangeCallback?.('connected');

        // Track user presence in Supabase Realtime
        if (this.userId) {
          try {
            await channel.track({
              id: this.userId,
              name: this.userName,
              isAdmin: this.isHost,
              email: this.userEmail,
              isRegisteredCustomer: this.isRegisteredCustomer,
              joinedAt: new Date().toISOString()
            });
          } catch {}
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        this.isConnected = false;
        this.onConnectionStateChangeCallback?.('disconnected');
      }
    });

    // 5. Connect local WebSocket relay as a high-speed parallel channel
    this.setupLocalRelay();

    // 6. Cross-Tab BroadcastChannel Listener
    if (crossTabChannel) {
      crossTabChannel.onmessage = (event) => {
        if (event.data) {
          this.onDataReceivedCallback?.(event.data);
        }
      };
    }
  }

  /**
   * High-speed parallel local relay setup for zero-packet-drop reliability
   */
  private setupLocalRelay() {
    try {
      if (globalWsFallback && (globalWsFallback.readyState === WebSocket.OPEN || globalWsFallback.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live/ws`;
      const ws = new WebSocket(wsUrl);
      globalWsFallback = ws;

      ws.onopen = () => {
        if (this.userId) {
          try {
            ws.send(JSON.stringify({
              type: 'JOIN',
              user: {
                id: this.userId,
                name: this.userName,
                isAdmin: this.isHost,
                email: this.userEmail,
                isRegisteredCustomer: this.isRegisteredCustomer
              }
            }));
          } catch {}
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'VIEWERS_UPDATE' && Array.isArray(data.viewers)) {
            this.onParticipantListChangedCallback?.(data.viewers);
          }
          this.onDataReceivedCallback?.(data);
        } catch {}
      };
    } catch {}
  }

  /**
   * Broadcast message over Supabase Realtime Channel
   */
  public sendDataMessage(payload: any) {
    // 1. Send via Supabase Realtime Broadcast Channel
    if (this.channel && this.isConnected) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'live_stream',
          payload: payload
        });
      } catch (err) {
        console.warn('Supabase Realtime broadcast warning:', err);
      }
    }

    // 2. Relay via Cross-Tab BroadcastChannel for zero-delay local preview
    if (crossTabChannel) {
      try { crossTabChannel.postMessage(payload); } catch {}
    }

    // 3. Relay via local fallback WS if available
    if (globalWsFallback && globalWsFallback.readyState === WebSocket.OPEN) {
      try {
        globalWsFallback.send(JSON.stringify({
          type: 'BROADCAST',
          payload
        }));
      } catch {}
    }
  }

  /**
   * Disconnect and clean up Supabase Realtime Channel
   */
  public disconnect() {
    if (this.channel) {
      try {
        this.channel.untrack();
        this.client.removeChannel(this.channel);
      } catch {}
      this.channel = null;
    }
    this.isConnected = false;
  }
}

export const supabaseRealtimeManager = new SupabaseRealtimeManager();
