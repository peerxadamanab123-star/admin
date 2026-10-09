import React, { useEffect, useRef } from 'react';
import { AssistantState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface AudioWaveformProps {
  state: AssistantState;
  audioLevel: number; // 0.0 to 1.0
  theme: ThemeConfig;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ state, audioLevel, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedLevelRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Smooth interpolation for audio level
      smoothedLevelRef.current += (audioLevel - smoothedLevelRef.current) * 0.2;
      phaseRef.current += state === 'speaking' ? 0.06 : state === 'listening' ? 0.03 : 0.01;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = width * 0.36;

      ctx.clearRect(0, 0, width, height);

      if (state === 'disconnected') {
        // Subtle ambient idle breathing ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = theme.waveform.idleStroke;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
        animId = requestAnimationFrame(render);
        return;
      }

      const numBars = 48;
      const step = (Math.PI * 2) / numBars;
      const currentLevel = smoothedLevelRef.current;

      for (let i = 0; i < numBars; i++) {
        const angle = i * step + phaseRef.current;
        // Harmonic noise simulation based on actual audio level
        const wave = Math.sin(angle * 3 + phaseRef.current * 2) * 0.5 + 0.5;
        const wave2 = Math.cos(angle * 5 - phaseRef.current) * 0.5 + 0.5;
        const reactiveMultiplier = state === 'speaking' ? 42 : state === 'listening' ? 32 : 8;
        const barHeight = 4 + (wave * 0.6 + wave2 * 0.4) * (currentLevel * reactiveMultiplier + (state === 'connecting' ? 6 : 2));

        const r1 = baseRadius - 2;
        const r2 = baseRadius + barHeight;

        const x1 = centerX + Math.cos(angle) * r1;
        const y1 = centerY + Math.sin(angle) * r1;
        const x2 = centerX + Math.cos(angle) * r2;
        const y2 = centerY + Math.sin(angle) * r2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        if (state === 'speaking') {
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, theme.waveform.speaking[0]);
          gradient.addColorStop(1, theme.waveform.speaking[1]);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2.5;
        } else if (state === 'listening') {
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, theme.waveform.listening[0]);
          gradient.addColorStop(1, theme.waveform.listening[1]);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = theme.waveform.connectingStroke;
          ctx.lineWidth = 1.5;
        }

        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Inner subtle glow circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius - 6, 0, Math.PI * 2);
      ctx.strokeStyle = theme.waveform.innerGlow[state];
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, audioLevel, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={360}
      className="pointer-events-none absolute inset-0 m-auto h-[320px] w-[320px] sm:h-[360px] sm:w-[360px]"
    />
  );
};
