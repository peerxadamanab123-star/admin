import React from 'react';
import { Mic, AlertTriangle } from 'lucide-react';

interface PermissionPromptProps {
  error: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}

export const PermissionPrompt: React.FC<PermissionPromptProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  if (!error) return null;

  const isMicError =
    error.toLowerCase().includes('permission') ||
    error.toLowerCase().includes('microphone') ||
    error.toLowerCase().includes('notallowederror') ||
    error.toLowerCase().includes('devices');

  return (
    <div className="fixed inset-x-4 top-20 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl bg-rose-950/90 p-4 text-rose-200 border border-rose-600/40 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600/20 text-rose-300">
            {isMicError ? <Mic className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              {isMicError ? 'Microphone Access Required' : 'Connection Notice'}
            </h4>
            <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
              {error}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onRetry}
                className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onDismiss}
                className="rounded-xl bg-rose-950/60 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
