import React from 'react';
import { AssistantState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface CyberHoloCircleProps {
  state: AssistantState;
  audioLevel: number; // 0.0 to 1.0
  theme: ThemeConfig;
  size?: number;
}

export const CyberHoloCircle: React.FC<CyberHoloCircleProps> = ({
  state,
  audioLevel,
  size = 380,
}) => {
  // Audio reactivity scaling and pulse
  const audioPulse = Math.min(0.28, audioLevel * 0.45);
  const baseScale = 1 + audioPulse;

  // Active state colors
  const glowColor =
    state === 'speaking'
      ? 'rgba(236, 72, 153, 0.65)'
      : state === 'listening'
      ? 'rgba(34, 211, 238, 0.6)'
      : state === 'connecting'
      ? 'rgba(168, 85, 247, 0.55)'
      : 'rgba(147, 51, 234, 0.35)';

  const accentColor =
    state === 'speaking'
      ? '#ec4899'
      : state === 'listening'
      ? '#22d3ee'
      : state === 'connecting'
      ? '#a855f7'
      : '#c084fc';

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ width: size, height: size }}
    >
      {/* 1. Deep Volumetric Ambient Glow Core */}
      <div
        className="absolute inset-0 rounded-full blur-[80px] transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(147, 51, 234, 0.25) 50%, transparent 75%)`,
          transform: `scale(${baseScale * 1.15})`,
          opacity: state === 'disconnected' ? 0.45 : 0.9,
        }}
      />

      {/* 2. Outer Rotating Particle / Degree Ring */}
      <div
        className="absolute inset-2 rounded-full border border-purple-500/30 transition-transform duration-1000"
        style={{
          boxShadow: `0 0 25px ${glowColor}`,
          animation:
            state === 'speaking'
              ? 'spin 12s linear infinite'
              : state === 'listening'
              ? 'spin 18s linear infinite'
              : 'spin 30s linear infinite',
        }}
      >
        {/* Orbital light beacons */}
        <span
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full shadow-[0_0_12px_#fff]"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full shadow-[0_0_10px_#fff]"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-2 w-2 rounded-full shadow-[0_0_8px_#fff]"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-2 w-2 rounded-full shadow-[0_0_8px_#fff]"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* 3. Concentric Dashed Radar Ring (Clockwise & Counter-Clockwise Counterparts) */}
      <div
        className="absolute inset-8 rounded-full border-2 border-dashed transition-all duration-500"
        style={{
          borderColor: accentColor,
          opacity: state === 'disconnected' ? 0.35 : 0.75,
          animation:
            state === 'speaking'
              ? 'spin 8s linear infinite reverse'
              : state === 'listening'
              ? 'spin 14s linear infinite reverse'
              : 'spin 25s linear infinite reverse',
        }}
      />

      {/* 4. Fine Digital HUD Tick Notches SVG Ring */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full transition-transform duration-300"
        style={{ transform: `scale(${baseScale})` }}
      >
        <defs>
          <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>

          <filter id="neonRingFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circular Coordinate Tracks */}
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="url(#ringGrad1)"
          strokeWidth="2.5"
          filter="url(#neonRingFilter)"
          opacity={state === 'disconnected' ? 0.5 : 0.9}
        />

        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.2"
          strokeDasharray="4 8"
          opacity="0.6"
        />

        <circle
          cx="200"
          cy="200"
          r="125"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1"
          strokeDasharray="12 16"
          opacity="0.5"
        />

        {/* Major Cardinal HUD Arcs */}
        <path
          d="M 200 25 A 175 175 0 0 1 375 200"
          fill="none"
          stroke="#f472b6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="20 40"
          filter="url(#neonRingFilter)"
          opacity={state === 'speaking' ? 0.95 : 0.6}
        />
        <path
          d="M 200 375 A 175 175 0 0 1 25 200"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="20 40"
          filter="url(#neonRingFilter)"
          opacity={state === 'listening' ? 0.95 : 0.6}
        />

        {/* Radar Ticks around perimeter */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 360) / 36;
          const isMajor = i % 9 === 0;
          const isMedium = i % 3 === 0;
          const tickLen = isMajor ? 14 : isMedium ? 8 : 4;
          const r1 = 186;
          const r2 = r1 - tickLen;
          const rad = (angle * Math.PI) / 180;
          const x1 = 200 + r1 * Math.cos(rad);
          const y1 = 200 + r1 * Math.sin(rad);
          const x2 = 200 + r2 * Math.cos(rad);
          const y2 = 200 + r2 * Math.sin(rad);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? '#f43f5e' : isMedium ? '#38bdf8' : '#a855f7'}
              strokeWidth={isMajor ? 2.5 : isMedium ? 1.5 : 1}
              opacity={isMajor ? 0.9 : 0.5}
            />
          );
        })}
      </svg>

      {/* 5. Center Optical Halo Rim with soft radial blur */}
      <div
        className="absolute inset-16 rounded-full border border-purple-300/40"
        style={{
          boxShadow: `inset 0 0 35px ${glowColor}, 0 0 30px ${glowColor}`,
          opacity: state === 'disconnected' ? 0.3 : 0.7,
        }}
      />
    </div>
  );
};
