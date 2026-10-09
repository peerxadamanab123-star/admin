/**
 * LiveSession
 * Maintains real-time WebSocket connection to Janu backend,
 * handling audio transmission, model speech reception, tool calls, and barge-in.
 */
import { ToolCallItem, VoiceOption } from '../types.ts';
import { AudioPlayer } from './AudioPlayer.ts';
import { ToolManager } from './ToolManager.ts';

export interface LiveSessionCallbacks {
  onStateChange: (state: 'connecting' | 'listening' | 'speaking' | 'disconnected') => void;
  onError: (errorMessage: string) => void;
  onLatencyUpdate?: (latencyMs: number) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private audioPlayer: AudioPlayer;
  private toolManager: ToolManager;
  private callbacks: LiveSessionCallbacks;
  private pingInterval: number | null = null;
  private pingTimestamp: number = 0;
  private isIntentionalClose: boolean = false;
  private currentVoice: VoiceOption = 'Aoede';

  constructor(
    audioPlayer: AudioPlayer,
    toolManager: ToolManager,
    callbacks: LiveSessionCallbacks
  ) {
    this.audioPlayer = audioPlayer;
    this.toolManager = toolManager;
    this.callbacks = callbacks;
  }

  public connect(voice: VoiceOption = 'Aoede'): Promise<void> {
    this.currentVoice = voice;
    this.isIntentionalClose = false;
    this.callbacks.onStateChange('connecting');

    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/api/live?voice=${encodeURIComponent(voice)}`;

        this.ws = new WebSocket(wsUrl);

        let opened = false;

        this.ws.onopen = () => {
          opened = true;
          this.startPingMonitoring();
        };

        this.ws.onmessage = async (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            await this.handleServerMessage(data, resolve);
          } catch (err: any) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (err) => {
          console.error('WebSocket connection error:', err);
          if (!opened) {
            this.callbacks.onError('Could not establish connection with Janu server.');
            this.callbacks.onStateChange('disconnected');
            reject(new Error('Connection failed'));
          }
        };

        this.ws.onclose = (e) => {
          this.stopPingMonitoring();
          this.audioPlayer.interrupt();
          if (!this.isIntentionalClose && e.code !== 1000) {
            const reason = e.reason ? `: ${e.reason}` : '';
            this.callbacks.onError(`Session closed${reason}`);
          }
          this.callbacks.onStateChange('disconnected');
        };
      } catch (err: any) {
        this.callbacks.onError(err?.message || 'Connection error');
        this.callbacks.onStateChange('disconnected');
        reject(err);
      }
    });
  }

  private async handleServerMessage(
    msg: any,
    resolveConnect?: (val: void) => void
  ): Promise<void> {
    switch (msg.type) {
      case 'connected':
        if (resolveConnect) {
          resolveConnect();
        }
        // Once connected, Janu is listening for user speech
        this.callbacks.onStateChange('listening');
        break;

      case 'status':
        if (msg.state === 'closed') {
          this.callbacks.onStateChange('disconnected');
        }
        break;

      case 'audio':
        if (msg.data) {
          // Model audio chunk received
          await this.audioPlayer.playChunk(msg.data);
        }
        break;

      case 'interrupted':
        // Model was interrupted by user voice (barge-in)
        this.audioPlayer.interrupt();
        this.callbacks.onStateChange('listening');
        break;

      case 'tool_call':
        if (msg.toolCalls && Array.isArray(msg.toolCalls)) {
          for (const call of msg.toolCalls as ToolCallItem[]) {
            const result = await this.toolManager.executeTool(
              call.id,
              call.name,
              call.args || {}
            );
            // Send tool result back promptly so Janu continues speaking
            this.sendToolResponse(call.id, call.name, result);
          }
        }
        break;

      case 'error':
        this.callbacks.onError(msg.message || 'Gemini Live error occurred.');
        break;

      case 'pong':
        if (this.pingTimestamp > 0 && this.callbacks.onLatencyUpdate) {
          const latency = Date.now() - this.pingTimestamp;
          this.callbacks.onLatencyUpdate(latency);
        }
        break;
    }
  }

  public sendAudio(base64PCM: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'audio', data: base64PCM }));
    }
  }

  public sendBargeIn(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'user_interrupted' }));
    }
    this.audioPlayer.interrupt();
  }

  private sendToolResponse(id: string, name: string, response: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'tool_response',
          id,
          name,
          response,
        })
      );
    }
  }

  private startPingMonitoring(): void {
    this.stopPingMonitoring();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pingTimestamp = Date.now();
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 5000);
  }

  private stopPingMonitoring(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public disconnect(): void {
    this.isIntentionalClose = true;
    this.stopPingMonitoring();
    this.audioPlayer.interrupt();

    if (this.ws) {
      try {
        this.ws.close(1000, 'User ended session');
      } catch (_) {}
      this.ws = null;
    }

    this.callbacks.onStateChange('disconnected');
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
