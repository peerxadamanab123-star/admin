import React from 'react';
import { Mic, MicOff, Power, Loader2, Sparkles, Volume2, Monitor, MonitorOff } from 'lucide-react';
import { AssistantState, VoiceOption } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';
import { AudioWaveform } from './AudioWaveform.tsx';
import { PurpleAnimeAvatar } from './PurpleAnimeAvatar.tsx';

interface CentralAssistantControlProps {
  state: AssistantState;
  audioLevel: number;
  isMuted: boolean;
  theme: ThemeConfig;
  isScreenSharing?: boolean;
  currentVoice?: VoiceOption;
  onChangeVoice?: (voice: VoiceOption) => void;
  onToggleSession: () => void;
  onInterrupt: () => void;
  onToggleScreenShare?: () => void;
}

export const CentralAssistantControl: React.FC<CentralAssistantControlProps> = ({
  state,
  audioLevel,
  isMuted,
  theme,
  isScreenSharing = false,
  currentVoice = 'Aoede',
  onChangeVoice,
  onToggleSession,
  onInterrupt,
  onToggleScreenShare,
}) => {
  const handleClick = () => {
    if (state === 'speaking') {
      // Tap to interrupt / barge-in while Everything is speaking
      onInterrupt();
    } else {
      onToggleSession();
    }
  };

  // Dynamic glow calculation based on audio reactivity
  const glowScale = 1 + Math.min(0.25, audioLevel * 0.4);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4 sm:py-6">
      {/* Waveform Canvas Layer around Everything's Avatar */}
      <AudioWaveform state={state} audioLevel={audioLevel} theme={theme} />

      {/* Outer Ambient Glow Aura */}
      <div
        className={`pointer-events-none absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full blur-3xl transition-all duration-700 ${
          theme.orb.glow[state]
        }`}
        style={{
          transform: `scale(${glowScale})`,
          opacity: state === 'disconnected' ? 0.35 : 0.85,
        }}
      />

      {/* Interactive Purple Anime Avatar as Central Assistant with Cyber Holo Circle */}
      <div className="relative z-10 flex cursor-pointer items-center justify-center">
        <PurpleAnimeAvatar
          state={state}
          audioLevel={audioLevel}
          theme={theme}
          onClick={handleClick}
        />
      </div>

      {/* Interactive Controls Bar - Clean, Compact & Elegant */}
      <div className="mt-4 flex flex-col items-center justify-center gap-2.5">
        {state === 'disconnected' ? (
          <>
            <button
              onClick={onToggleSession}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Talk to MAX</span>
            </button>

            {/* Boy / Girl Voice Switcher Option */}
            {onChangeVoice && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/85 border border-purple-500/30 backdrop-blur-md shadow-lg">
                <button
                  type="button"
                  onClick={() => onChangeVoice('Aoede')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    !['Puck', 'Charon', 'Fenrir'].includes(currentVoice || '')
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.45)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Girl Voice"
                >
                  <span>👧</span>
                  <span>Girl Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeVoice('Puck')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    ['Puck', 'Charon', 'Fenrir'].includes(currentVoice || '')
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.45)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Boy Voice"
                >
                  <span>👦</span>
                  <span>Boy Voice</span>
                </button>
              </div>
            )}
          </>
        ) : (
            <div className="flex items-center gap-1.5">
              {state === 'speaking' && (
                <button
                  onClick={onInterrupt}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 px-3 py-1.5 text-xs font-semibold text-purple-200 border border-purple-500/40 transition-all shadow-md"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Interrupt</span>
                </button>
              )}

              {onToggleScreenShare && (
                <button
                  onClick={onToggleScreenShare}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all shadow-md ${
                    isScreenSharing
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900'
                      : 'bg-slate-900/80 border-teal-500/30 text-teal-200 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
                >
                  {isScreenSharing ? (
                    <>
                      <MonitorOff className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Screen On</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="h-3.5 w-3.5 text-teal-400" />
                      <span>Screen</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onToggleSession}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all shadow-md ${theme.orb.endCallBtn}`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>End Call</span>
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
