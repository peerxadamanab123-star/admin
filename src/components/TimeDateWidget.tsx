import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Globe, Sparkles, Move, X } from 'lucide-react';
import { ThemeConfig } from '../theme/themes.ts';

interface TimeDateWidgetProps {
  theme: ThemeConfig;
  onRelocate?: () => void;
  onClose?: () => void;
  className?: string;
}

export const TimeDateWidget: React.FC<TimeDateWidgetProps> = ({
  theme,
  onRelocate,
  onClose,
  className = '',
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateFormatted = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className={`relative group w-full max-w-[280px] rounded-2xl bg-slate-950/80 p-4 border border-purple-500/25 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:border-purple-400/50 ${className}`}>
      {/* Soft Ambient Glow */}
      <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-purple-600/20 blur-xl" />

      {/* Header Label */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/15">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
          <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Time & Date</span>
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
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
        </div>
      </div>

      {/* Digital Clock Display */}
      <div className="flex flex-col">
        <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
          {hours}
        </div>

        {/* Date Display */}
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-pink-400 shrink-0" />
          <span className="truncate">{dateFormatted}</span>
        </div>

        {/* Timezone Pill */}
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-purple-950/50 px-2 py-1 text-[10px] font-mono text-purple-300 border border-purple-500/20">
          <Globe className="h-3 w-3 text-cyan-400" />
          <span className="truncate">{timeZone}</span>
        </div>
      </div>
    </div>
  );
};
