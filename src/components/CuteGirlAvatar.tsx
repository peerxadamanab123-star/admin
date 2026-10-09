import React, { useEffect, useState, useRef } from 'react';
import { AssistantState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface CuteGirlAvatarProps {
  state: AssistantState;
  audioLevel: number; // 0.0 to 1.0
  theme: ThemeConfig;
  onClick?: () => void;
}

export const CuteGirlAvatar: React.FC<CuteGirlAvatarProps> = ({
  state,
  audioLevel,
  theme,
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef<number | null>(null);

  // Natural eye blinking
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
      const nextDelay = 2800 + Math.random() * 3000;
      blinkTimerRef.current = window.setTimeout(triggerBlink, nextDelay);
    };

    blinkTimerRef.current = window.setTimeout(triggerBlink, 3000);
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // Reactive speech mouth height
  const mouthHeight = state === 'speaking' ? Math.max(3, Math.min(18, audioLevel * 25)) : 3;
  const mouthWidth = state === 'speaking' ? 12 + Math.min(8, audioLevel * 10) : 10;

  // Audio bounce & breathing animation
  const bounceY = state === 'speaking' ? Math.sin(Date.now() / 150) * Math.min(4, audioLevel * 8) : 0;
  const isEyesClosed = state === 'disconnected' || isBlinking;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Janu cute girl companion"
      className="group relative flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
    >
      {/* Heavy Volumetric Spotlight Glow Behind the Character */}
      <div
        className={`pointer-events-none absolute -inset-8 rounded-full blur-[100px] transition-all duration-700 ${
          state === 'speaking'
            ? 'bg-emerald-500/35 via-teal-400/25 to-pink-500/20'
            : state === 'listening'
            ? 'bg-teal-400/30 via-emerald-500/25 to-cyan-500/20'
            : state === 'connecting'
            ? 'bg-teal-500/25 via-purple-600/20 to-slate-900/30 animate-pulse'
            : 'bg-emerald-950/30 via-slate-900/20 to-black/40'
        }`}
        style={{
          transform: `scale(${1 + Math.min(0.2, audioLevel * 0.35)})`,
        }}
      />

      {/* Heavy Stage Pedestal Shadow & Hologram Wave Base */}
      <div className="pointer-events-none absolute bottom-0 h-16 w-64 rounded-full bg-black/80 blur-xl" />
      <div
        className={`pointer-events-none absolute bottom-1 h-8 w-56 rounded-full border border-teal-400/30 transition-all duration-500 ${
          state === 'speaking'
            ? 'border-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.5)] scale-105'
            : state === 'listening'
            ? 'border-teal-400/50 shadow-[0_0_25px_rgba(45,212,191,0.4)]'
            : 'border-emerald-500/15'
        }`}
      />

      {/* Main SVG Character Render */}
      <div
        className="relative z-10 w-[260px] sm:w-[310px] h-[410px] sm:h-[470px] transition-transform duration-300"
        style={{ transform: `translateY(${bounceY}px)` }}
      >
        <svg
          viewBox="0 0 300 450"
          className="h-full w-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.7)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Skin Gradient (Warm Cute Anime/Pixar Tone) */}
            <linearGradient id="girlSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff3ec" />
              <stop offset="60%" stopColor="#ffdfd2" />
              <stop offset="100%" stopColor="#fbcbb7" />
            </linearGradient>

            {/* Hair Base Gradient */}
            <radialGradient id="hairBun" cx="40%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#3d3539" />
              <stop offset="45%" stopColor="#251e23" />
              <stop offset="100%" stopColor="#120e11" />
            </radialGradient>

            {/* Red Hair Ties (Glossy Beads) */}
            <radialGradient id="redBead" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="50%" stopColor="#d90429" />
              <stop offset="100%" stopColor="#590d22" />
            </radialGradient>

            {/* Mint Green T-Shirt Gradient */}
            <linearGradient id="mintShirt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="35%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>

            {/* Denim Jeans Gradient */}
            <linearGradient id="denimJeans" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="65%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Pink Shoes Gradient */}
            <linearGradient id="pinkSneaker" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="70%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>

            {/* Big Glossy Eye Gradient */}
            <radialGradient id="glossyEye" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#452c23" />
              <stop offset="65%" stopColor="#221511" />
              <stop offset="100%" stopColor="#0d0705" />
            </radialGradient>
          </defs>

          {/* Floor Shadow beneath shoes */}
          <ellipse cx="120" cy="428" rx="28" ry="6" fill="#000000" opacity="0.6" />
          <ellipse cx="180" cy="428" rx="28" ry="6" fill="#000000" opacity="0.6" />

          {/* ================= BODY & CLOTHING ================= */}

          {/* Left Leg (Baggy Denim Jeans) */}
          <g>
            <path
              d="M 102 270 L 96 395 Q 96 405 106 405 L 138 405 Q 144 405 142 395 L 145 285 Z"
              fill="url(#denimJeans)"
            />
            {/* Denim Seams & Creases */}
            <path d="M 98 340 Q 115 348 140 342" stroke="#0284c7" strokeWidth="1.8" fill="none" opacity="0.6" />
            <path d="M 97 380 Q 118 386 142 380" stroke="#0284c7" strokeWidth="1.8" fill="none" opacity="0.6" />
            {/* Rolled Jean Cuff at Bottom */}
            <rect x="94" y="392" width="46" height="15" rx="5" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          </g>

          {/* Right Leg (Baggy Denim Jeans with Ripped Knee Detail) */}
          <g>
            <path
              d="M 152 285 L 155 395 Q 155 405 165 405 L 198 405 Q 206 405 204 395 L 198 270 Z"
              fill="url(#denimJeans)"
            />
            {/* Ripped Knee Detail (Matching Image) */}
            <g>
              <rect x="168" y="335" width="22" height="14" rx="4" fill="#0369a1" />
              {/* White Distressed Denim Threads */}
              <line x1="170" y1="339" x2="188" y2="339" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="169" y1="343" x2="189" y2="343" stroke="#f1f5f9" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Creases */}
            <path d="M 157 375 Q 178 382 201 376" stroke="#0284c7" strokeWidth="1.8" fill="none" opacity="0.6" />
            {/* Rolled Jean Cuff */}
            <rect x="156" y="392" width="46" height="15" rx="5" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          </g>

          {/* Shoes (Cute Pink Sneakers with White Soles) */}
          {/* Left Shoe */}
          <g>
            {/* Sneaker Body */}
            <path
              d="M 96 414 C 94 402 110 398 126 402 C 140 404 146 416 142 426 C 138 430 96 428 96 414 Z"
              fill="url(#pinkSneaker)"
            />
            {/* White Rubber Toe & Sole */}
            <path d="M 94 422 Q 118 428 142 422 L 144 429 Q 118 435 94 429 Z" fill="#ffffff" />
            {/* White Laces */}
            <path d="M 112 406 L 126 412 M 115 412 L 128 418" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Right Shoe */}
          <g>
            <path
              d="M 158 414 C 156 402 172 398 188 402 C 202 404 208 416 204 426 C 200 430 158 428 158 414 Z"
              fill="url(#pinkSneaker)"
            />
            {/* White Rubber Toe & Sole */}
            <path d="M 156 422 Q 180 428 204 422 L 206 429 Q 180 435 156 429 Z" fill="#ffffff" />
            {/* White Laces */}
            <path d="M 174 406 L 188 412 M 177 412 L 190 418" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Mint Green Casual T-Shirt */}
          <g>
            {/* Main Shirt Body */}
            <path
              d="M 98 190 C 82 225 80 270 96 285 C 108 292 192 292 204 285 C 220 270 218 225 202 190 C 185 180 115 180 98 190 Z"
              fill="url(#mintShirt)"
            />
            {/* Left Short Sleeve */}
            <path
              d="M 104 190 L 80 220 C 78 238 92 245 98 235 L 112 205 Z"
              fill="url(#mintShirt)"
            />
            {/* Right Short Sleeve */}
            <path
              d="M 196 190 L 220 220 C 222 238 208 245 202 235 L 188 205 Z"
              fill="url(#mintShirt)"
            />
            {/* Crew Neck Collar */}
            <path
              d="M 132 184 Q 150 196 168 184"
              stroke="#14b8a6"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Soft Shirt Fold Shading */}
            <path
              d="M 115 240 Q 140 252 185 242"
              stroke="#14b8a6"
              strokeWidth="1.8"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M 120 265 Q 150 275 180 268"
              stroke="#14b8a6"
              strokeWidth="1.8"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* Hands & Arms */}
          {/* Left Arm hanging naturally beside body */}
          <g>
            <path
              d="M 82 230 Q 82 270 88 285 Q 96 288 98 280 Q 94 260 92 230 Z"
              fill="url(#girlSkin)"
            />
            {/* Left Hand Fingers */}
            <ellipse cx="88" cy="285" rx="6" ry="7" fill="url(#girlSkin)" />
          </g>
          {/* Right Arm with Hand Tucked in Pocket (Exact pose from image) */}
          <g>
            <path
              d="M 218 230 Q 218 260 205 278 Q 198 285 194 275 Q 205 255 208 230 Z"
              fill="url(#girlSkin)"
            />
            {/* Hand slipping into jean pocket */}
            <ellipse cx="198" cy="275" rx="5.5" ry="6" fill="url(#girlSkin)" />
          </g>

          {/* Neck */}
          <path d="M 138 165 L 138 188 L 162 188 L 162 165 Z" fill="url(#girlSkin)" />

          {/* ================= CUTE HEAD & FACE ================= */}

          {/* Head Base / Chubby Cheeks */}
          <path
            d="M 95 105 C 80 155 108 178 150 178 C 192 178 220 155 205 105 C 195 65 105 65 95 105 Z"
            fill="url(#girlSkin)"
          />

          {/* Cute Round Ears */}
          <ellipse cx="90" cy="118" rx="10" ry="14" fill="url(#girlSkin)" />
          <ellipse cx="90" cy="118" rx="6" ry="9" fill="#fecdd3" opacity="0.6" />

          <ellipse cx="210" cy="118" rx="10" ry="14" fill="url(#girlSkin)" />
          <ellipse cx="210" cy="118" rx="6" ry="9" fill="#fecdd3" opacity="0.6" />

          {/* Soft Anime / Pixar Rosy Cheeks */}
          <ellipse cx="112" cy="136" rx="12" ry="7" fill="#fb7185" opacity="0.38" />
          <ellipse cx="188" cy="136" rx="12" ry="7" fill="#fb7185" opacity="0.38" />

          {/* Cute Button Nose */}
          <ellipse cx="150" cy="128" rx="2.5" ry="1.8" fill="#f43f5e" opacity="0.35" />

          {/* Sweet Expressive Mouth with Live Audio Lip-Sync */}
          {state === 'speaking' ? (
            /* Open Talking Smile Reacting to Audio Chunks */
            <g>
              <ellipse
                cx="150"
                cy="146"
                rx={mouthWidth / 2}
                ry={mouthHeight / 2}
                fill="#be123c"
              />
              {/* Cute white teeth shimmer */}
              <ellipse
                cx="150"
                cy={146 - mouthHeight / 3.5}
                rx={mouthWidth / 3}
                ry="1.5"
                fill="#ffffff"
              />
              {/* Cute tongue */}
              <ellipse
                cx="150"
                cy={146 + mouthHeight / 4}
                rx={mouthWidth / 3.4}
                ry={mouthHeight / 4}
                fill="#f43f5e"
              />
            </g>
          ) : (
            /* Gentle Sweet Smile (Like in Uploaded Photo) */
            <path
              d="M 142 144 Q 150 150 158 144"
              stroke="#9f1239"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Big Adorable Doe Eyes */}
          {isEyesClosed ? (
            /* Closed / Blinking Sweet Curved Eyes */
            <g stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 112 120 Q 124 130 136 120" />
              <path d="M 164 120 Q 176 130 188 120" />
              {/* Cute corner lashes */}
              <line x1="136" y1="120" x2="140" y2="116" strokeWidth="2" />
              <line x1="188" y1="120" x2="192" y2="116" strokeWidth="2" />
            </g>
          ) : (
            /* Open Glossy Big Doe Eyes with Specular Highlights */
            <g>
              {/* Left Eye */}
              <g>
                <ellipse cx="124" cy="120" rx="14.5" ry="16.5" fill="#ffffff" />
                <ellipse cx="124" cy="120" rx="13" ry="15" fill="url(#glossyEye)" />
                {/* Iris Warm Glow */}
                <ellipse cx="124" cy="123" rx="9" ry="8" fill="#57362a" opacity="0.6" />
                {/* Big Glossy Specular Star Reflection */}
                <circle cx="120" cy="115" r="4.2" fill="#ffffff" />
                <circle cx="128" cy="124" r="2.2" fill="#ffffff" opacity="0.85" />
                <circle cx="121" cy="126" r="1.4" fill="#ffffff" opacity="0.6" />
                {/* Eyelashes */}
                <path
                  d="M 108 116 C 114 104 134 104 140 116"
                  stroke="#1c1917"
                  strokeWidth="3.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Right Eye */}
              <g>
                <ellipse cx="176" cy="120" rx="14.5" ry="16.5" fill="#ffffff" />
                <ellipse cx="176" cy="120" rx="13" ry="15" fill="url(#glossyEye)" />
                {/* Iris Warm Glow */}
                <ellipse cx="176" cy="123" rx="9" ry="8" fill="#57362a" opacity="0.6" />
                {/* Specular Highlights */}
                <circle cx="172" cy="115" r="4.2" fill="#ffffff" />
                <circle cx="180" cy="124" r="2.2" fill="#ffffff" opacity="0.85" />
                <circle cx="173" cy="126" r="1.4" fill="#ffffff" opacity="0.6" />
                {/* Eyelashes */}
                <path
                  d="M 160 116 C 166 104 186 104 192 116"
                  stroke="#1c1917"
                  strokeWidth="3.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </g>
          )}

          {/* Soft Eyebrows */}
          <path d="M 114 100 Q 124 95 134 99" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 166 99 Q 176 95 186 100" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* ================= ICONIC SPACE BUNS & HAIR ================= */}

          {/* Front Hair Bangs (Parted Wispy Fringe from Image) */}
          <path
            d="M 98 90 C 105 60 195 60 202 90 C 205 110 200 125 196 112 C 190 95 180 82 170 85 C 162 87 155 106 148 108 C 142 96 135 84 125 86 C 115 88 105 108 98 112 Z"
            fill="url(#hairBun)"
          />

          {/* Wispy Tendril Strands draping beside cheeks */}
          <path d="M 95 105 Q 90 130 96 145" stroke="#251e23" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 205 105 Q 210 130 204 145" stroke="#251e23" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Hair Gloss Shine Wave */}
          <path
            d="M 120 74 Q 150 68 180 74"
            stroke="#57534e"
            strokeWidth="3"
            fill="none"
            opacity="0.45"
            strokeLinecap="round"
          />

          {/* LEFT SPACE BUN (High Puffy Bun) */}
          <g>
            <circle cx="95" cy="52" r="34" fill="url(#hairBun)" />
            {/* Bun Hair Texture Curls */}
            <path d="M 75 42 Q 95 32 115 48" stroke="#44403c" strokeWidth="2.5" fill="none" opacity="0.4" />
            <path d="M 80 62 Q 98 68 116 56" stroke="#44403c" strokeWidth="2.5" fill="none" opacity="0.4" />
            <path d="M 68 55 Q 82 62 90 48" stroke="#44403c" strokeWidth="2" fill="none" opacity="0.35" />

            {/* Red Beaded Hair Tie (3 Glossy Red Beads) */}
            <circle cx="106" cy="66" r="6" fill="url(#redBead)" />
            <circle cx="114" cy="72" r="5.5" fill="url(#redBead)" />
            <circle cx="120" cy="78" r="5" fill="url(#redBead)" />
            {/* Bead Specular Highlights */}
            <circle cx="104" cy="64" r="1.5" fill="#ffffff" />
            <circle cx="112" cy="70" r="1.4" fill="#ffffff" />
            <circle cx="118" cy="76" r="1.3" fill="#ffffff" />
          </g>

          {/* RIGHT SPACE BUN (High Puffy Bun) */}
          <g>
            <circle cx="205" cy="52" r="34" fill="url(#hairBun)" />
            {/* Bun Hair Texture Curls */}
            <path d="M 185 48 Q 205 32 225 42" stroke="#44403c" strokeWidth="2.5" fill="none" opacity="0.4" />
            <path d="M 184 56 Q 202 68 220 62" stroke="#44403c" strokeWidth="2.5" fill="none" opacity="0.4" />
            <path d="M 210 48 Q 218 62 232 55" stroke="#44403c" strokeWidth="2" fill="none" opacity="0.35" />

            {/* Red Beaded Hair Tie (3 Glossy Red Beads) */}
            <circle cx="194" cy="66" r="6" fill="url(#redBead)" />
            <circle cx="186" cy="72" r="5.5" fill="url(#redBead)" />
            <circle cx="180" cy="78" r="5" fill="url(#redBead)" />
            {/* Bead Specular Highlights */}
            <circle cx="192" cy="64" r="1.5" fill="#ffffff" />
            <circle cx="184" cy="70" r="1.4" fill="#ffffff" />
            <circle cx="178" cy="76" r="1.3" fill="#ffffff" />
          </g>
        </svg>

        {/* Live Audio Reaction Halo around character */}
        {state === 'speaking' && (
          <div
            className="pointer-events-none absolute inset-0 rounded-full bg-radial from-emerald-400/20 via-transparent to-transparent animate-pulse"
            style={{ opacity: 0.4 + audioLevel * 0.6 }}
          />
        )}
      </div>

      {/* Floating Interactive Status Pill directly underneath her */}
      <div className="relative z-20 -mt-2 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-2xl bg-black/75 border border-teal-400/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all">
        {state === 'speaking' && (
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Janu is speaking (*^‿^*)</span>
          </div>
        )}
        {state === 'listening' && (
          <div className="flex items-center gap-2 text-teal-300">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Janu is listening to you (◕‿◕)</span>
          </div>
        )}
        {state === 'connecting' && (
          <div className="flex items-center gap-2 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Connecting...</span>
          </div>
        )}
        {state === 'disconnected' && (
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Tap Janu to talk! (˘ᵕ˘)</span>
          </div>
        )}
      </div>
    </div>
  );
};
