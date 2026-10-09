import React, { useEffect, useState, useRef } from 'react';
import { AssistantState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';
import { CyberHoloCircle } from './CyberHoloCircle.tsx';

interface PurpleAnimeAvatarProps {
  state: AssistantState;
  audioLevel: number; // 0.0 to 1.0
  theme: ThemeConfig;
  onClick?: () => void;
}

export const PurpleAnimeAvatar: React.FC<PurpleAnimeAvatarProps> = ({
  state,
  audioLevel,
  theme,
  onClick,
}) => {
  const [displayMode, setDisplayMode] = useState<'janu' | 'anime'>('janu');
  const [isBlinking, setIsBlinking] = useState(false);
  const [tick, setTick] = useState(0);
  const blinkTimerRef = useRef<number | null>(null);

  // Audio bounce & breathing animation
  const bounceY = state === 'speaking' ? Math.sin(Date.now() / 150) * Math.min(3.5, audioLevel * 7) : 0;
  const isEyesClosed = state === 'disconnected' || isBlinking;

  // Animation frame loop for lively equalizer bars and HUD pulsing
  useEffect(() => {
    let animId: number;
    const update = () => {
      setTick((t) => (t + 1) % 360);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Natural eye blinking (for anime mode)
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      const nextDelay = 2600 + Math.random() * 3000;
      blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
    };

    blinkTimerRef.current = window.setTimeout(triggerBlink, 3000);
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Reactive speech mouth height (for anime mode)
  const mouthHeight = state === 'speaking' ? Math.max(3, Math.min(18, audioLevel * 24)) : 2.5;
  const mouthWidth = state === 'speaking' ? 12 + Math.min(8, audioLevel * 10) : 10;

  // Equalizer bar heights reactive to audioLevel and tick
  const eqBars = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((offset, idx) => {
    const base = 8 + Math.abs(5 - Math.abs(offset)) * 2.5;
    const wave = Math.sin((tick * 8 + idx * 35) * (Math.PI / 180)) * 6;
    const audioBoost = (audioLevel || (state === 'speaking' ? 0.35 : 0.05)) * (20 + (5 - Math.abs(offset)) * 6);
    return Math.max(6, Math.min(50, base + wave + audioBoost));
  });

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="MAX AI companion avatar"
      className="group relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
    >
      {/* Spectacular Cyber Holographic Circle Behind Character */}
      <CyberHoloCircle
        state={state}
        audioLevel={audioLevel}
        theme={theme}
        size={390}
      />

      {/* Heavy Stage Pedestal Shadow */}
      <div className="pointer-events-none absolute bottom-0 h-16 w-64 rounded-full bg-black/85 blur-xl" />
      <div
        className={`pointer-events-none absolute bottom-1 h-7 w-56 rounded-full border transition-all duration-500 ${
          state === 'speaking'
            ? 'border-pink-500/70 shadow-[0_0_28px_rgba(236,72,153,0.55)] scale-105'
            : state === 'listening'
            ? 'border-cyan-400/60 shadow-[0_0_24px_rgba(34,211,238,0.45)]'
            : 'border-purple-500/25'
        }`}
      />

      {/* Main SVG Render - BOLD LETTERS "JANU" or Anime Companion */}
      <div
        className="relative z-10 w-[280px] sm:w-[330px] h-[410px] sm:h-[470px] transition-transform duration-300 flex items-center justify-center"
        style={{ transform: `translateY(${bounceY}px)` }}
      >
        <svg
          viewBox="0 0 320 420"
          className="h-full w-full drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Bold Neon Gradient for JANU Letters */}
            <linearGradient id="januBoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              {theme.id === 'heavy-emerald' ? (
                <>
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="30%" stopColor="#10b981" />
                  <stop offset="70%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </>
              ) : theme.id === 'midnight-blue' ? (
                <>
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#60a5fa" />
                  <stop offset="70%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </>
              ) : theme.id === 'sakura-anime' ? (
                <>
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="35%" stopColor="#fb7185" />
                  <stop offset="70%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#a855f7" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="30%" stopColor="#818cf8" />
                  <stop offset="65%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </>
              )}
            </linearGradient>

            {/* Glowing Neon Outline Filter */}
            <filter id="januGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 3D Deep Extrusion Shadow Gradient */}
            <linearGradient id="janu3dDepth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Shiny Bevel Stroke Highlight */}
            <linearGradient id="januBevelShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#e0e7ff" stopOpacity="0.8" />
              <stop offset="75%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#312e81" stopOpacity="0.1" />
            </linearGradient>

            {/* Equalizer Bar Gradient */}
            <linearGradient id="januEqGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {displayMode === 'janu' ? (
            /* ============================================================== */
            /* BOLD LETTERS "JANU" - HIGH-TECH CYBER HOLOGRAPHIC TYPOGRAPHY   */
            /* ============================================================== */
            <g id="januBoldTypography">
              {/* Outer HUD Corner Brackets */}
              <g stroke="url(#januBoldGrad)" strokeWidth="1.8" fill="none" opacity="0.85">
                {/* Top-Left Bracket */}
                <path d="M 36 145 L 36 125 L 56 125" />
                {/* Top-Right Bracket */}
                <path d="M 284 145 L 284 125 L 264 125" />
                {/* Bottom-Left Bracket */}
                <path d="M 36 295 L 36 315 L 56 315" />
                {/* Bottom-Right Bracket */}
                <path d="M 284 295 L 284 315 L 264 315" />
              </g>

              {/* Side Precision Crosshair Markers */}
              <g stroke="#ffffff" strokeWidth="1.2" opacity="0.4">
                <line x1="38" y1="220" x2="48" y2="220" />
                <line x1="43" y1="215" x2="43" y2="225" />
                <line x1="272" y1="220" x2="282" y2="220" />
                <line x1="277" y1="215" x2="277" y2="225" />
              </g>

              {/* Top Tech Chip Badge */}
              <g transform="translate(160, 142)">
                <rect
                  x="-72"
                  y="-12"
                  width="144"
                  height="24"
                  rx="12"
                  fill="#030712"
                  fillOpacity="0.85"
                  stroke="url(#januBoldGrad)"
                  strokeWidth="1.2"
                />
                <circle cx="-54" cy="0" r="3" fill="#38bdf8" />
                <text
                  x="6"
                  y="4"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="800"
                  fontSize="9.5"
                  letterSpacing="3"
                  fill="#e2e8f0"
                >
                  AI COMPANION
                </text>
              </g>

              {/* Holographic Concentric Wave Ring behind JANU */}
              <circle
                cx="160"
                cy="220"
                r="95"
                fill="none"
                stroke="url(#januBoldGrad)"
                strokeWidth="1"
                strokeDasharray="4 8"
                opacity="0.3"
                transform={`rotate(${tick} 160 220)`}
              />
              <circle
                cx="160"
                cy="220"
                r="72"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeDasharray="3 12"
                opacity="0.2"
                transform={`rotate(${-tick * 1.5} 160 220)`}
              />

              {/* ========================================================== */}
              {/* MAIN BOLD LETTERS: MAX                                     */}
              {/* ========================================================== */}
              {/* Layer 1: Ambient Neon Glow Aura */}
              <text
                x="160"
                y="228"
                textAnchor="middle"
                fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="92"
                letterSpacing="12"
                fill="none"
                stroke="url(#januBoldGrad)"
                strokeWidth="12"
                strokeLinejoin="round"
                filter="url(#januGlowFilter)"
                opacity={state === 'speaking' ? 0.95 : 0.65}
              >
                MAX
              </text>

              {/* Layer 2: Deep 3D Obsidian Drop Shadow */}
              <text
                x="160"
                y="235"
                textAnchor="middle"
                fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="92"
                letterSpacing="12"
                fill="url(#janu3dDepth)"
              >
                MAX
              </text>

              {/* Layer 3: Mid 3D Extrusion Layer */}
              <text
                x="160"
                y="231"
                textAnchor="middle"
                fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="92"
                letterSpacing="12"
                fill="#0f172a"
              >
                MAX
              </text>

              {/* Layer 4: Main Face - Bold Solid Letters in Cyber Gradient */}
              <text
                x="160"
                y="226"
                textAnchor="middle"
                fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="92"
                letterSpacing="12"
                fill="url(#januBoldGrad)"
              >
                MAX
              </text>

              {/* Layer 5: Top Metallic/Specular Bevel Outline */}
              <text
                x="160"
                y="226"
                textAnchor="middle"
                fontFamily="'Montserrat', 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="92"
                letterSpacing="12"
                fill="none"
                stroke="url(#januBevelShine)"
                strokeWidth="2"
              >
                MAX
              </text>

              {/* Dynamic Audio Visualizer Equalizer Bars below JANU */}
              <g id="januEqVisualizer" transform="translate(160, 260)">
                {eqBars.map((height, i) => {
                  const x = (i - 5) * 11;
                  return (
                    <rect
                      key={i}
                      x={x - 2.5}
                      y={-height / 2}
                      width="5"
                      height={height}
                      rx="2.5"
                      fill="url(#januEqGrad)"
                      opacity={state === 'disconnected' ? 0.45 : 0.9}
                    />
                  );
                })}
              </g>

              {/* Subtitle Tech Line: "« CORE INTELLIGENCE »" */}
              <text
                x="160"
                y="300"
                textAnchor="middle"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize="11"
                letterSpacing="4"
                fill="#38bdf8"
                opacity="0.9"
              >
                « CORE INTELLIGENCE »
              </text>

              {/* Creator Credit Badge: "CREATED BY SYED MANAN" */}
              <text
                x="160"
                y="326"
                textAnchor="middle"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="800"
                fontSize="10"
                letterSpacing="3"
                fill="#cbd5e1"
                opacity="0.8"
              >
                CREATED BY SYED MANAN
              </text>

              {/* Bottom State Status Pill */}
              <g transform="translate(160, 356)">
                <rect
                  x="-70"
                  y="-11"
                  width="140"
                  height="22"
                  rx="11"
                  fill="#020617"
                  fillOpacity="0.85"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <circle
                  cx="-50"
                  cy="0"
                  r="3.5"
                  className={theme.orb.indicatorDot[state]}
                />
                <text
                  x="8"
                  y="4"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="700"
                  fontSize="9"
                  letterSpacing="2"
                  fill="#94a3b8"
                >
                  {state === 'speaking'
                    ? 'SPEAKING'
                    : state === 'listening'
                    ? 'LISTENING'
                    : state === 'connecting'
                    ? 'CONNECTING'
                    : 'ONLINE'}
                </text>
              </g>
            </g>
          ) : (
            /* Anime Character Mode */
            <g id="animeGirlCharacter">
              {/* Lilac Hair Base Gradient */}
              <linearGradient id="purpleHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d8b4fe" />
                <stop offset="25%" stopColor="#c084fc" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="90%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>

              {/* Hair Shadow */}
              <linearGradient id="hairShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b21a8" />
                <stop offset="50%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>

              {/* Skin */}
              <linearGradient id="fairSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff8f5" />
                <stop offset="45%" stopColor="#fdeee7" />
                <stop offset="85%" stopColor="#fcdfd2" />
                <stop offset="100%" stopColor="#f8c9b9" />
              </linearGradient>

              {/* Dark Sweater */}
              <linearGradient id="darkSweater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2a2538" />
                <stop offset="40%" stopColor="#1b1725" />
                <stop offset="85%" stopColor="#110d19" />
                <stop offset="100%" stopColor="#0a0810" />
              </linearGradient>

              {/* Back Hair Mass */}
              <path
                d="M 68 140 C 45 200, 35 290, 42 360 C 45 390, 75 410, 100 410 C 130 410, 160 415, 190 410 C 220 410, 252 390, 256 360 C 265 290, 255 200, 232 140 Z"
                fill="url(#hairShadowGrad)"
              />

              {/* Shoulders & Sweater */}
              <path
                d="M 52 380 C 70 330, 95 310, 150 310 C 205 310, 230 330, 248 380 C 255 400, 258 420, 258 440 L 42 440 C 42 420, 45 400, 52 380 Z"
                fill="url(#darkSweater)"
              />

              {/* Neck & Face */}
              <path d="M 132 250 L 132 295 C 132 305, 168 305, 168 295 L 168 250 Z" fill="url(#fairSkin)" />
              <path
                d="M 96 160 C 96 230, 120 270, 150 270 C 180 270, 204 230, 204 160 C 204 110, 180 85, 150 85 C 120 85, 96 110, 96 160 Z"
                fill="url(#fairSkin)"
              />

              {/* Anime Eyes */}
              <g id="animeEyes">
                {/* Left Eye */}
                <ellipse cx="128" cy="172" rx="10" ry={isEyesClosed ? 1.5 : 12} fill="#3b0764" />
                {!isEyesClosed && <ellipse cx="128" cy="172" rx="7" ry="9" fill="#c084fc" />}
                {!isEyesClosed && <circle cx="125" cy="168" r="3" fill="#ffffff" />}

                {/* Right Eye */}
                <ellipse cx="172" cy="172" rx="10" ry={isEyesClosed ? 1.5 : 12} fill="#3b0764" />
                {!isEyesClosed && <ellipse cx="172" cy="172" rx="7" ry="9" fill="#c084fc" />}
                {!isEyesClosed && <circle cx="169" cy="168" r="3" fill="#ffffff" />}
              </g>

              {/* Cute Anime Nose & Reactive Mouth */}
              <circle cx="150" cy="192" r="1.2" fill="#e11d48" opacity="0.6" />
              <ellipse
                cx="150"
                cy="208"
                rx={mouthWidth / 2}
                ry={mouthHeight / 2}
                fill={state === 'speaking' ? '#f43f5e' : '#fda4af'}
              />

              {/* Front Bangs Hair */}
              <path
                d="M 88 140 C 95 90, 130 75, 150 75 C 170 75, 205 90, 212 140 C 190 120, 165 145, 150 135 C 135 145, 110 120, 88 140 Z"
                fill="url(#purpleHairGrad)"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
