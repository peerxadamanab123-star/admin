/**
 * AudioStreamer
 * Captures microphone audio, converts to 16,000 Hz PCM16, and streams chunks.
 */
import { arrayBufferToBase64, calculateRMS, float32ToInt16PCM, resampleAudio } from '../utils/audio-utils.ts';

export class AudioStreamer {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isRunning: boolean = false;
  private muted: boolean = false;

  private onAudioChunkCallback: ((base64PCM: string) => void) | null = null;
  private onAudioLevelCallback: ((level: number) => void) | null = null;

  public async start(
    onAudioChunk: (base64PCM: string) => void,
    onAudioLevel?: (level: number) => void
  ): Promise<void> {
    if (this.isRunning) {
      this.stop();
    }

    this.onAudioChunkCallback = onAudioChunk;
    this.onAudioLevelCallback = onAudioLevel || null;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialize AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const inputSampleRate = this.audioContext.sampleRate;
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // ScriptProcessor with 2048 buffer size gives ~43-46ms latency chunks at 44.1/48kHz
      this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1);

      this.processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
        if (!this.isRunning || this.muted) {
          if (this.onAudioLevelCallback) {
            this.onAudioLevelCallback(0);
          }
          return;
        }

        const inputChannelData = event.inputBuffer.getChannelData(0);

        // Compute volume level for real-time waveform UI
        if (this.onAudioLevelCallback) {
          const level = calculateRMS(inputChannelData);
          this.onAudioLevelCallback(level);
        }

        // Resample from browser hardware rate (e.g., 44.1/48kHz) to target 16,000 Hz
        const resampledData = resampleAudio(inputChannelData, inputSampleRate, 16000);

        // Convert to 16-bit PCM little-endian
        const pcm16Data = float32ToInt16PCM(resampledData);

        // Convert to Base64
        const base64PCM = arrayBufferToBase64(pcm16Data);

        if (this.onAudioChunkCallback && base64PCM) {
          this.onAudioChunkCallback(base64PCM);
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isRunning = true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public stop(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.isRunning = false;

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch (_) {}
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (_) {}
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }

    if (this.onAudioLevelCallback) {
      this.onAudioLevelCallback(0);
    }
  }
}
