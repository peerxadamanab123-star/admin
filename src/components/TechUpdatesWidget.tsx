import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Radio, Sparkles, TrendingUp, ChevronRight, Move, X } from 'lucide-react';
import { AssistantState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface TechUpdatesWidgetProps {
  state: AssistantState;
  latencyMs: number;
  theme: ThemeConfig;
  onRelocate?: () => void;
  onClose?: () => void;
  className?: string;
}

const TECH_HIGHLIGHTS = [
  { tag: 'LIVE API', title: 'Gemini 3.1 Flash Live', desc: 'Audio-to-audio streaming at 16kHz/24kHz' },
  { tag: 'LATENCY', title: 'Sub-100ms Barge-In', desc: 'Instant natural speech interruption' },
  { tag: 'AGENTS', title: 'Multimodal Tool Execution', desc: 'Real-time browser control & screen share' },
  { tag: 'AI TREND', title: 'Bilingual Reasoning', desc: 'Fluid Hindi & English conversational synthesis' },
];

export const TechUpdatesWidget: React.FC<TechUpdatesWidgetProps> = ({
  state,
  latencyMs,
  onRelocate,
  onClose,
  className = '',
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto-rotate updates every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % TECH_HIGHLIGHTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeHighlight = TECH_HIGHLIGHTS[currentIdx];

  return (
    <div className={`relative group w-full max-w-[280px] rounded-2xl bg-slate-950/80 p-4 border border-cyan-500/25 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:border-cyan-400/50 ${className}`}>
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-600/20 blur-xl" />

      {/* Header Label */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
          <Cpu className="h-3.5 w-3.5 text-pink-400" />
          <span>AI Info & Tech</span>
        </div>
        <div className="flex items-center gap-1">
          {onRelocate && (
            <button
              onClick={onRelocate}
              className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
              title="Relocate this widget"
            >
              <Move className="h-3 w-3" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-slate-800/80 transition-colors"
              title="Remove widget"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30 ml-1">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            <span>{latencyMs > 0 ? `${latencyMs}ms` : '3.1 Live'}</span>
          </div>
        </div>
      </div>

      {/* Engine Status Specs */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Core Engine:</span>
          <span className="font-semibold text-white">Gemini 3.1 Flash</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Sample Rate:</span>
          <span className="font-mono text-cyan-300">16kHz In / 24kHz Out</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400">Neural State:</span>
          <span className="capitalize font-medium text-pink-300">{state}</span>
        </div>
      </div>

      {/* Tech Updates Rotator */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] font-semibold text-purple-300 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-cyan-400" />
            <span>Tech Update</span>
          </span>
          <span className="font-mono text-slate-500">
            {currentIdx + 1}/{TECH_HIGHLIGHTS.length}
          </span>
        </div>

        <div className="rounded-xl bg-purple-950/40 p-2 border border-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="rounded bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-pink-300">
              {activeHighlight.tag}
            </span>
          </div>
          <div className="mt-1 text-xs font-bold text-white tracking-wide">
            {activeHighlight.title}
          </div>
          <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
            {activeHighlight.desc}
          </p>
        </div>
      </div>
    </div>
  );
};
