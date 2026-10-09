import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe, Clock, CheckCircle2, X } from 'lucide-react';
import { ToolExecutionEvent } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface ToolExecutionCardProps {
  event: ToolExecutionEvent | null;
  theme: ThemeConfig;
  onDismiss: () => void;
}

export const ToolExecutionCard: React.FC<ToolExecutionCardProps> = ({ event, theme, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      // Auto-dismiss after 10 seconds if user does not interact
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [event, onDismiss]);

  if (!event || !visible) return null;

  const isWebsite = event.name === 'openWebsite';
  const url = event.result?.url || event.args?.url;
  const title = event.result?.title || event.args?.title || url;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 w-[92%] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border transition-all duration-300 ${theme.toolCard.bg} ${theme.toolCard.border}`}>
        {/* Glow neon accent */}
        <div className={`absolute -left-10 -top-10 h-28 w-28 rounded-full blur-xl pointer-events-none ${theme.toolCard.glow}`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.toolCard.iconBg} ${theme.toolCard.iconColor}`}>
              {isWebsite ? <Globe className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.toolCard.titleColor}`}>
                  {isWebsite ? 'Browser Action Executed' : 'Everything AI Action'}
                </span>
              </div>

              <h4 className="mt-0.5 truncate text-sm font-semibold text-white">
                {isWebsite ? `Opened ${title}` : event.result?.message || 'Tool executed'}
              </h4>

              {isWebsite && url && (
                <p className="mt-0.5 truncate text-xs font-mono text-slate-400">
                  {url}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isWebsite && url && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${theme.toolCard.actionBtn}`}
            >
              <span>Visit Link</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-[11px] text-slate-400">
              {event.result?.popupOpened ? 'Opened in browser tab' : 'Tap to open directly'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
