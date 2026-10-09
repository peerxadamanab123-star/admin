import React from 'react';
import { Crown, Sparkles, Award, ShieldCheck, Move, X } from 'lucide-react';
import { ThemeConfig } from '../theme/themes.ts';

interface CreatorWidgetProps {
  theme: ThemeConfig;
  onRelocate?: () => void;
  onClose?: () => void;
  className?: string;
}

export const CreatorWidget: React.FC<CreatorWidgetProps> = ({
  onRelocate,
  onClose,
  className = '',
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Neon Aura */}
      <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-cyan-500/30 blur-xl opacity-75" />

      {/* Main Glass Card */}
      <div className="relative flex flex-col items-center rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 px-5 py-2.5 sm:px-6 sm:py-3 border border-purple-400/40 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-pink-400/95 drop-shadow-[0_0_8px_rgba(244,63,94,0.45)]">
            <Crown className="h-3 w-3 text-amber-300" />
            <span>CREATOR</span>
            <Sparkles className="h-2.5 w-2.5 text-cyan-300" />
          </div>

          {(onRelocate || onClose) && (
            <div className="flex items-center gap-1">
              {onRelocate && (
                <button
                  onClick={onRelocate}
                  className="p-0.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
                  title="Relocate this widget"
                >
                  <Move className="h-2.5 w-2.5" />
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-0.5 rounded text-slate-400 hover:text-pink-400 hover:bg-slate-800/80 transition-colors"
                  title="Remove widget"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Name: "SYED MANAN" written inside */}
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg md:text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-purple-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            SYED MANAN
          </span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
            <ShieldCheck className="h-3 w-3" />
          </span>
        </div>

        {/* Subtitle / Signature */}
        <div className="mt-0.5 text-[9px] font-mono text-purple-300/70 tracking-widest uppercase">
          Lead Architect // Everything AI
        </div>
      </div>
    </div>
  );
};
