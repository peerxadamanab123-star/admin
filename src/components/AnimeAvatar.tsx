import React, { useEffect, useState, useRef } from 'react';
import { AssistantState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface AnimeAvatarProps {
  state: AssistantState;
  audioLevel: number; // 0.0 to 1.0
  theme: ThemeConfig;
  size?: number;
}

export const AnimeAvatar: React.FC<AnimeAvatarProps> = ({
  state,
  audioLevel,
  theme,
  size = 280,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef<number | null>(null);

  // Natural blinking interval
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);

      // Random next blink between 2.5 and 5 seconds
      const nextDelay = 2500 + Math.random() * 2500;
      blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
    };

    blinkTimerRef.current = window.setTimeout(triggerBlink, 3000);

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Compute mouth open height based on audioLevel when speaking
  const mouthOpenHeight = state === 'speaking' ? Math.max(3, Math.min(22, audioLevel * 30)) : 3;
  const mouthWidth = state === 'speaking' ? 14 + Math.min(8, audioLevel * 10) : 12;

  // Headset glow intensity based on audio
  const headsetGlowOpacity = 0.4 + Math.min(0.6, audioLevel * 0.9);

  // Eye state:
  // Disconnected: sleeping / closed eyes
  // Otherwise: open eyes (or temporarily blinking)
  const isEyesClosed = state === 'disconnected' || isBlinking;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer Cybernetic Holographic Rings */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-full border border-dashed transition-all duration-1000 ${
          state === 'speaking'
            ? 'border-pink-400/50 animate-[spin_10s_linear_infinite] scale-105'
            : state === 'listening'
            ? 'border-cyan-400/50 animate-[spin_14s_linear_infinite]'
            : state === 'connecting'
            ? 'border-purple-400/60 animate-[spin_5s_linear_infinite]'
            : 'border-purple-500/20'
        }`}
      />

      {/* Second Inner Cyber Ring with Accent Nodes */}
      <div
        className={`pointer-events-none absolute inset-2 rounded-full border border-dotted transition-all duration-700 ${
          state === 'speaking'
            ? 'border-fuchsia-400/40 animate-[spin_18s_linear_infinite_reverse]'
            : state === 'listening'
            ? 'border-sky-400/40 animate-[spin_20s_linear_infinite_reverse]'
            : 'border-white/10'
        }`}
      />

      {/* Floating Cybernetic HUD Markers */}
      <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950/80 border border-purple-500/30 text-[9px] font-mono tracking-widest text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>JANU // AI-01</span>
      </div>

      {/* Main SVG Avatar Container */}
      <div
        className={`relative h-[88%] w-[88%] overflow-hidden rounded-full border-2 transition-all duration-500 shadow-2xl backdrop-blur-xl ${
          state === 'speaking'
            ? 'border-pink-400/70 shadow-[0_0_40px_rgba(236,72,153,0.4)]'
            : state === 'listening'
            ? 'border-cyan-400/70 shadow-[0_0_40px_rgba(6,182,212,0.4)]'
            : state === 'connecting'
            ? 'border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
            : 'border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.15)]'
        }`}
      >
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Gradient */}
            <radialGradient id="avatarBg" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1a103c" />
              <stop offset="60%" stopColor="#0a061a" />
              <stop offset="100%" stopColor="#04020a" />
            </radialGradient>

            {/* Hair Base Gradient */}
            <linearGradient id="hairBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="40%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>

            {/* Cyber Hair Highlights */}
            <linearGradient id="cyberHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </linearGradient>

            {/* Skin Gradient */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff1eb" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>

            {/* Eye Gradient */}
            <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="45%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Headset Glow */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Ambient Circle */}
          <rect width="200" height="200" fill="url(#avatarBg)" />

          {/* Digital Cyber Grid Overlay in Background */}
          <g opacity="0.15" stroke="#a855f7" strokeWidth="0.5">
            <line x1="20" y1="0" x2="20" y2="200" />
            <line x1="60" y1="0" x2="60" y2="200" />
            <line x1="100" y1="0" x2="100" y2="200" />
            <line x1="140" y1="0" x2="140" y2="200" />
            <line x1="180" y1="0" x2="180" y2="200" />
            <line x1="0" y1="40" x2="200" y2="40" />
            <line x1="0" y1="80" x2="200" y2="80" />
            <line x1="0" y1="120" x2="200" y2="120" />
            <line x1="0" y1="160" x2="200" y2="160" />
          </g>

          {/* Holographic Particle Sparks */}
          <circle cx="45" cy="50" r="1.5" fill="#38bdf8" opacity="0.6" />
          <circle cx="160" cy="65" r="1.2" fill="#e879f9" opacity="0.7" />
          <circle cx="35" cy="140" r="1.8" fill="#a855f7" opacity="0.5" />
          <circle cx="165" cy="130" r="1.5" fill="#22d3ee" opacity="0.6" />

          {/* Back Hair Volume */}
          <path
            d="M 50 100 C 30 130 35 180 50 200 L 150 200 C 165 180 170 130 150 100 C 145 60 55 60 50 100 Z"
            fill="url(#hairBase)"
          />

          {/* Neck and Shoulders (Cyber Attire) */}
          <path
            d="M 88 140 L 88 165 L 112 165 L 112 140 Z"
            fill="url(#skinGrad)"
          />
          {/* Cyber Neck Collar / Choker with Glowing Node */}
          <path
            d="M 86 150 Q 100 155 114 150 L 114 157 Q 100 162 86 157 Z"
            fill="#1e1b4b"
          />
          <circle
            cx="100"
            cy="156"
            r="2.5"
            fill="#22d3ee"
            filter="url(#neonGlow)"
            opacity={headsetGlowOpacity}
          />

          {/* Cyber Shoulders / Jacket */}
          <path
            d="M 55 200 C 60 175 80 165 100 165 C 120 165 140 175 145 200 Z"
            fill="#0f172a"
          />
          {/* Neon Jacket Lapels */}
          <path
            d="M 75 168 L 88 195 L 98 175 Z"
            fill="#1e1e38"
            stroke="#c084fc"
            strokeWidth="0.8"
          />
          <path
            d="M 125 168 L 112 195 L 102 175 Z"
            fill="#1e1e38"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />

          {/* Face Contour */}
          <path
            d="M 68 95 C 68 135 84 155 100 155 C 116 155 132 135 132 95 C 132 70 68 70 68 95 Z"
            fill="url(#skinGrad)"
          />

          {/* Soft Anime Blush */}
          <ellipse cx="78" cy="120" rx="6.5" ry="3.5" fill="#f43f5e" opacity="0.32" />
          <ellipse cx="122" cy="120" rx="6.5" ry="3.5" fill="#f43f5e" opacity="0.32" />

          {/* Anime Cute Nose */}
          <path
            d="M 99.5 116 L 100.5 119"
            stroke="#ea580c"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Dynamic Anime Mouth */}
          {state === 'speaking' ? (
            /* Open talking mouth scaled by audio level */
            <g>
              <ellipse
                cx="100"
                cy="133"
                rx={mouthWidth / 2}
                ry={mouthOpenHeight / 2}
                fill="#be123c"
              />
              {/* Cute upper teeth shine */}
              <ellipse
                cx="100"
                cy={133 - mouthOpenHeight / 3.5}
                rx={mouthWidth / 2.8}
                ry="1.8"
                fill="#ffffff"
                opacity="0.9"
              />
              {/* Tongue */}
              <ellipse
                cx="100"
                cy={133 + mouthOpenHeight / 3.8}
                rx={mouthWidth / 3.2}
                ry={mouthOpenHeight / 4}
                fill="#fb7185"
              />
            </g>
          ) : state === 'listening' ? (
            /* Gentle attentive smile */
            <path
              d="M 94 131 Q 100 136 106 131"
              stroke="#b91c1c"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          ) : state === 'connecting' ? (
            /* Small curious 'o' mouth */
            <circle cx="100" cy="132" r="2.8" fill="#be123c" />
          ) : (
            /* Soft resting smile */
            <path
              d="M 95 132 Q 100 135 105 132"
              stroke="#991b1b"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          )}

          {/* Anime Eyes */}
          {isEyesClosed ? (
            /* Closed / Sleeping / Blinking Eyes: graceful happy curves */
            <g stroke="#3730a3" strokeWidth="2.2" strokeLinecap="round" fill="none">
              <path d="M 75 110 Q 84 116 91 111" />
              <path d="M 109 111 Q 116 116 125 110" />
              {/* Cute little eyelashes */}
              <line x1="91" y1="111" x2="93" y2="108" strokeWidth="1.4" />
              <line x1="125" y1="110" x2="127" y2="107" strokeWidth="1.4" />
            </g>
          ) : (
            /* Open Expressive Anime Eyes */
            <g>
              {/* Left Eye */}
              <g>
                {/* Upper Eyelash Contour */}
                <path
                  d="M 72 108 C 76 100 89 100 93 108"
                  fill="none"
                  stroke="#1e1b4b"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <line x1="93" y1="108" x2="95.5" y2="105" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" />

                {/* Eyeball / Sclera */}
                <ellipse cx="82.5" cy="111" rx="8" ry="9" fill="#ffffff" />

                {/* Iris (Gradient Cyan-Blue-Purple) */}
                <ellipse cx="82.5" cy="112" rx="6.5" ry="8" fill="url(#eyeGrad)" />

                {/* Pupil */}
                <ellipse cx="82.5" cy="113" rx="3.5" ry="4.5" fill="#0f172a" />

                {/* Specular Highlights / Light Sparkles */}
                <circle cx="80" cy="108.5" r="2.4" fill="#ffffff" />
                <circle cx="85" cy="114" r="1.3" fill="#ffffff" opacity="0.85" />
                <circle cx="81" cy="115.5" r="0.8" fill="#67e8f9" />
              </g>

              {/* Right Eye */}
              <g>
                {/* Upper Eyelash Contour */}
                <path
                  d="M 107 108 C 111 100 124 100 128 108"
                  fill="none"
                  stroke="#1e1b4b"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <line x1="128" y1="108" x2="130.5" y2="105" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" />

                {/* Eyeball / Sclera */}
                <ellipse cx="117.5" cy="111" rx="8" ry="9" fill="#ffffff" />

                {/* Iris */}
                <ellipse cx="117.5" cy="112" rx="6.5" ry="8" fill="url(#eyeGrad)" />

                {/* Pupil */}
                <ellipse cx="117.5" cy="113" rx="3.5" ry="4.5" fill="#0f172a" />

                {/* Specular Highlights */}
                <circle cx="115" cy="108.5" r="2.4" fill="#ffffff" />
                <circle cx="120" cy="114" r="1.3" fill="#ffffff" opacity="0.85" />
                <circle cx="116" cy="115.5" r="0.8" fill="#67e8f9" />
              </g>
            </g>
          )}

          {/* Delicate Eyebrows */}
          <path
            d="M 75 97 Q 83 94 90 98"
            stroke="#6b21a8"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 110 98 Q 117 94 125 97"
            stroke="#6b21a8"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Anime Hair Bangs & Front Strands */}
          <path
            d="M 64 88 C 65 72 78 62 100 62 C 122 62 135 72 136 88 C 137 102 135 118 133 135 C 131 120 128 102 125 96 C 122 90 115 106 112 108 C 110 96 105 92 101 94 C 97 92 92 98 89 108 C 86 102 79 90 76 96 C 73 102 70 120 68 135 C 66 118 64 102 64 88 Z"
            fill="url(#hairBase)"
          />

          {/* Cyber Cyan Streaks / Neon Hair Highlights */}
          <path
            d="M 72 90 C 74 102 77 118 78 128 C 76 116 75 102 76 94 Z"
            fill="url(#cyberHighlight)"
          />
          <path
            d="M 124 90 C 126 102 123 118 122 128 C 124 116 125 102 124 94 Z"
            fill="url(#cyberHighlight)"
          />
          <path
            d="M 98 64 C 104 68 107 78 106 88 C 103 82 100 74 96 68 Z"
            fill="url(#cyberHighlight)"
          />

          {/* Hair Shine Ring (Anime Angel Ring) */}
          <ellipse
            cx="100"
            cy="74"
            rx="26"
            ry="6"
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1.8"
            opacity="0.55"
          />

          {/* Cybernetic Holographic Headset / Earpieces */}
          {/* Left Earpiece */}
          <g>
            <rect
              x="57"
              y="96"
              width="9"
              height="20"
              rx="4"
              fill="#0f172a"
              stroke="#22d3ee"
              strokeWidth="1.2"
            />
            {/* Glowing Audio Visualizer Bars on Earpiece */}
            <line
              x1="61.5"
              y1="100"
              x2="61.5"
              y2={100 + Math.max(3, audioLevel * 12)}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              opacity={headsetGlowOpacity}
            />
          </g>

          {/* Right Earpiece */}
          <g>
            <rect
              x="134"
              y="96"
              width="9"
              height="20"
              rx="4"
              fill="#0f172a"
              stroke="#ec4899"
              strokeWidth="1.2"
            />
            {/* Glowing Audio Visualizer Bars on Right Earpiece */}
            <line
              x1="138.5"
              y1="100"
              x2="138.5"
              y2={100 + Math.max(3, audioLevel * 12)}
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              opacity={headsetGlowOpacity}
            />
          </g>

          {/* Headset Band Arc */}
          <path
            d="M 61 96 C 63 60 137 60 139 96"
            fill="none"
            stroke="#334155"
            strokeWidth="3.2"
          />
          <path
            d="M 72 70 C 85 64 115 64 128 70"
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Floating Cybernetic Hair Pins / Neon Bow Clamps */}
          <polygon
            points="65,76 72,72 70,80"
            fill="#06b6d4"
            filter="url(#neonGlow)"
            opacity="0.9"
          />
          <polygon
            points="135,76 128,72 130,80"
            fill="#d946ef"
            filter="url(#neonGlow)"
            opacity="0.9"
          />
        </svg>

        {/* Live Audio Reaction Ripple Overlay */}
        {state === 'speaking' && (
          <div
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-pink-500/20 via-transparent to-cyan-500/15 animate-pulse"
            style={{ opacity: 0.3 + audioLevel * 0.7 }}
          />
        )}
      </div>

      {/* State Badge Overlay on Avatar Bottom */}
      <div className="absolute -bottom-2 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide backdrop-blur-xl border shadow-lg transition-all">
        {state === 'speaking' && (
          <span className="flex items-center gap-1.5 text-pink-300 bg-pink-950/80 border-pink-500/40">
            <span className="h-2 w-2 rounded-full bg-pink-400 animate-ping" />
            <span>(*^▽^*) Speaking</span>
          </span>
        )}
        {state === 'listening' && (
          <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/80 border-cyan-500/40">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>(◕‿◕) Listening...</span>
          </span>
        )}
        {state === 'connecting' && (
          <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/80 border-amber-500/40">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>(・_・) Syncing...</span>
          </span>
        )}
        {state === 'disconnected' && (
          <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 border-purple-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>(˘ᵕ˘) Standby</span>
          </span>
        )}
      </div>
    </div>
  );
};
