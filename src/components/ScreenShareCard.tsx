import React, { useEffect, useRef, useState } from 'react';
import { Monitor, MonitorOff, Maximize2, Minimize2, Radio } from 'lucide-react';
import { ThemeConfig } from '../theme/themes.ts';

interface ScreenShareCardProps {
  stream: MediaStream | null;
  theme: ThemeConfig;
  onStop: () => void;
}

export const ScreenShareCard: React.FC<ScreenShareCardProps> = ({
  stream,
  theme,
  onStop,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
        isExpanded
          ? 'inset-4 sm:inset-10 flex flex-col'
          : 'bottom-20 right-4 sm:right-8 w-72 sm:w-80'
      }`}
    >
      <div className="relative flex flex-col overflow-hidden rounded-2xl bg-black/85 backdrop-blur-2xl border border-teal-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.85)] h-full">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-teal-500/20">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-teal-200">
              Screen Share Active
            </span>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Minimize' : 'Maximize'}
              aria-label={isExpanded ? 'Minimize screen share' : 'Maximize screen share'}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 px-2 py-1 text-[11px] font-medium text-white transition-colors"
              title="Stop sharing"
              aria-label="Stop sharing"
            >
              <MonitorOff className="h-3 w-3" />
              <span>Stop</span>
            </button>
          </div>
        </div>

        {/* Video Display */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[140px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-mono text-slate-300 backdrop-blur-sm">
            <Monitor className="h-3 w-3 text-teal-400" />
            <span>Sharing to Everything</span>
          </div>
        </div>
      </div>
    </div>
  );
};
