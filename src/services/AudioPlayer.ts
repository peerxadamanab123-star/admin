/**
 * AudioPlayer
 * Plays 24,000 Hz PCM audio using Web Audio API with gapless scheduling,
 * real-time amplitude analysis, and immediate interruption cancellation.
 */
import { base64PCMToFloat32 } from '../utils/audio-utils.ts';

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private nextScheduledTime: number = 0;
  private activeSourceNodes: Set<AudioBufferSourceNode> = new Set();
  private isPlaying: boolean = false;
  private volume: number = 1.0;

  private onPlaybackStateChange?: (isPlaying: boolean) => void;

  constructor(onPlaybackStateChange?: (isPlaying: boolean) => void) {
    this.onPlaybackStateChange = onPlaybackStateChange;
  }

  private initAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      // Model audio output is 24,000 Hz
      this.audioContext = new AudioCtx({ sampleRate: 24000 });
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.4;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  public async playChunk(base64PCM: string): Promise<void> {
    if (!base64PCM) return;

    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const float32Samples = base64PCMToFloat32(base64PCM);
    if (float32Samples.length === 0) return;

    // Create 24kHz audio buffer
    const audioBuffer = ctx.createBuffer(1, float32Samples.length, 24000);
    audioBuffer.getChannelData(0).set(float32Samples);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    if (this.gainNode) {
      source.connect(this.gainNode);
    } else {
      source.connect(ctx.destination);
    }

    const currentTime = ctx.currentTime;
    // Schedule ahead: if nextScheduledTime is in the past, add tiny lookahead buffer (40ms)
    const startTime = Math.max(currentTime + 0.04, this.nextScheduledTime);
    this.nextScheduledTime = startTime + audioBuffer.duration;

    this.activeSourceNodes.add(source);

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.onPlaybackStateChange?.(true);
    }

    source.onended = () => {
      this.activeSourceNodes.delete(source);
      if (this.activeSourceNodes.size === 0) {
        // If no more active buffers and playback caught up to schedule
        if (ctx.currentTime >= this.nextScheduledTime - 0.05) {
          this.isPlaying = false;
          this.onPlaybackStateChange?.(false);
        }
      }
    };

    source.start(startTime);
  }

  /**
   * Immediately stops all currently playing and queued audio
   * Used for user barge-in and model interruption
   */
  public interrupt(): void {
    for (const source of this.activeSourceNodes) {
      try {
        source.stop(0);
        source.disconnect();
      } catch (_) {}
    }
    this.activeSourceNodes.clear();

    if (this.audioContext) {
      this.nextScheduledTime = this.audioContext.currentTime;
    } else {
      this.nextScheduledTime = 0;
    }

    if (this.isPlaying) {
      this.isPlaying = false;
      this.onPlaybackStateChange?.(false);
    }
  }

  /**
   * Get instantaneous speaking RMS level (0.0 to 1.0) for visualizer
   */
  public getAudioLevel(): number {
    if (!this.isPlaying || !this.analyserNode) {
      return 0;
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / (dataArray.length * 255);
    return Math.min(1, avg * 2.2);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public close(): void {
    this.interrupt();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
  }
}
