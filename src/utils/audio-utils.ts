/**
 * Audio processing utilities for Janu Voice Assistant
 * Supports 16 kHz input PCM streaming and 24 kHz output playback
 */

/**
 * Resample Float32 audio buffer from inputSampleRate to targetSampleRate (16,000 Hz)
 */
export function resampleAudio(
  inputData: Float32Array,
  inputSampleRate: number,
  targetSampleRate: number = 16000
): Float32Array {
  if (inputSampleRate === targetSampleRate) {
    return inputData;
  }
  const ratio = inputSampleRate / targetSampleRate;
  const newLength = Math.round(inputData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalPos = i * ratio;
    const index = Math.floor(originalPos);
    const fraction = originalPos - index;

    if (index + 1 < inputData.length) {
      // Linear interpolation
      result[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
    } else {
      result[i] = inputData[index] || 0;
    }
  }

  return result;
}

/**
 * Convert Float32 audio samples (-1.0 to 1.0) to 16-bit PCM ArrayBuffer (Little Endian)
 */
export function float32ToInt16PCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to -1.0 .. 1.0
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

/**
 * Encode Int16Array / ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  let binary = '';
  const bytes = ArrayBuffer.isView(buffer)
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB chunks to prevent call-stack overflow

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
}

/**
 * Decode base64 16-bit PCM string into Float32Array for Web Audio API playback
 */
export function base64PCMToFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit PCM = 2 bytes per sample
  const dataView = new DataView(bytes.buffer);
  const sampleCount = Math.floor(len / 2);
  const float32 = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const int16 = dataView.getInt16(i * 2, true); // little-endian
    float32[i] = int16 / 32768.0;
  }

  return float32;
}

/**
 * Compute Root Mean Square (RMS) volume level (0.0 to 1.0)
 */
export function calculateRMS(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  // Scale and clamp nicely for visualization
  return Math.min(1, rms * 5.0);
}
