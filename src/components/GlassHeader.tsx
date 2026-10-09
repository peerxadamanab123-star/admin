import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Info,
  Radio,
  Volume2,
  VolumeX,
  X,
  Globe,
  Zap,
  Palette,
  Check,
} from 'lucide-react';
import { AssistantState, VoiceOption, ThemeId, AVAILABLE_VOICES } from '../types.ts';
import { ThemeConfig, THEMES } from '../theme/themes.ts';

interface GlassHeaderProps {
  state: AssistantState;
  latencyMs: number;
  isMuted: boolean;
  volume: number;
  currentVoice: VoiceOption;
  theme: ThemeConfig;
  currentTheme: ThemeId;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onChangeVoice: (voice: VoiceOption) => void;
  onChangeTheme: (themeId: ThemeId) => void;
  onOpenRelocate?: () => void;
  onOpenChrome?: () => void;
  isChromeOpen?: boolean;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  state,
  latencyMs,
  isMuted,
  volume,
  currentVoice,
  theme,
  currentTheme,
  onToggleMute,
  onChangeVolume,
  onChangeVoice,
  onChangeTheme,
  onOpenRelocate,
  onOpenChrome,
  isChromeOpen,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const volumeMenuRef = useRef<HTMLDivElement>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);

  const isBoyVoice = ['Puck', 'Charon', 'Fenrir'].includes(currentVoice);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (volumeMenuRef.current && !volumeMenuRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(e.target as Node)) {
        setShowVoiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`relative z-20 flex w-full items-center justify-between px-4 py-3 sm:px-8 sm:py-4 backdrop-blur-xl border-b transition-colors duration-500 ${theme.header.bg} ${theme.header.border}`}
      >
        {/* Everything Brand Identity */}
        <div className="flex items-center gap-3">
          <div
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all duration-500 ${theme.header.brandBadge}`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  state === 'speaking'
                    ? 'bg-pink-400 animate-ping'
                    : state === 'listening'
                    ? 'bg-cyan-400 animate-ping'
                    : state === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              />
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  state === 'speaking'
                    ? 'bg-pink-500'
                    : state === 'listening'
                    ? 'bg-cyan-500'
                    : state === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-slate-600'
                }`}
              />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                MAX
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-colors ${theme.header.livePill}`}
              >
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-teal-300/90 hidden xs:block font-medium">
              By Syed Manan • English & हिन्दी
            </p>
          </div>
        </div>

        {/* Controls and Status indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Latency Indicator (when connected) */}
          {state !== 'disconnected' && (
            <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 border border-purple-500/20">
              <Radio
                className={`h-3 w-3 ${
                  latencyMs > 0 ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="font-mono text-[11px]">
                {latencyMs > 0 ? `${latencyMs}ms` : 'Live'}
              </span>
            </div>
          )}

          {/* Theme Selector Dropdown */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${theme.header.controlButton}`}
              title="Change Interface Theme"
              aria-label="Theme selector"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{theme.name}</span>
              <span
                className="h-2 w-2 rounded-full inline-block"
                style={{ backgroundColor: theme.dotColor }}
              />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-11 z-40 w-64 rounded-2xl bg-slate-950/95 p-2 shadow-2xl border border-purple-500/30 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Interface Theme
                </div>
                <div className="mt-1 space-y-1">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const item = THEMES[themeKey];
                    const isActive = currentTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          onChangeTheme(themeKey);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          isActive
                            ? 'bg-purple-600/25 text-white border border-purple-500/40'
                            : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-white/10"
                            style={{ backgroundColor: item.dotColor }}
                          />
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {item.tagline}
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* MAX Chrome Browser Button */}
          {onOpenChrome && (
            <button
              onClick={onOpenChrome}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${
                isChromeOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : theme.header.controlButton
              } hover:border-cyan-400`}
              title="Open MAX's Own Chrome Browser"
              aria-label="MAX Chrome Browser"
            >
              <div className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-teal-400 p-0.5">
                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                </div>
              </div>
              <span className="font-semibold text-white">MAX Chrome</span>
            </button>
          )}

          {/* Boy / Girl Voice Switcher */}
          <div className="relative" ref={voiceMenuRef}>
            <button
              onClick={() => setShowVoiceMenu(!showVoiceMenu)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${theme.header.controlButton} hover:border-pink-500/50`}
              title="Change Voice: Switch between Girl & Boy Voice"
              aria-label="Boy and Girl Voice Switcher"
            >
              <span className="text-sm">{isBoyVoice ? '👦' : '👧'}</span>
              <span className="font-semibold text-white">
                {isBoyVoice ? 'Boy Voice' : 'Girl Voice'}
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                ({currentVoice})
              </span>
            </button>

            {showVoiceMenu && (
              <div className="absolute right-0 top-11 z-40 w-72 rounded-2xl bg-slate-950/95 p-3 shadow-2xl border border-purple-500/30 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-white">
                    Voice Settings
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400">
                    Boy & Girl Voice
                  </span>
                </div>

                {/* 1-Tap Quick Switch between Girl and Boy */}
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => {
                      onChangeVoice('Aoede');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      !isBoyVoice
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👧</span>
                    <span>Girl Voice</span>
                  </button>
                  <button
                    onClick={() => {
                      onChangeVoice('Puck');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      isBoyVoice
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👦</span>
                    <span>Boy Voice</span>
                  </button>
                </div>

                {/* Girl Voices Section */}
                <div className="mt-3">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-pink-400">
                    👧 Girl Voices (Female)
                  </div>
                  <div className="mt-1 space-y-1">
                    {AVAILABLE_VOICES.filter((v) => v.gender === 'girl').map((v) => {
                      const isActive = currentVoice === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            onChangeVoice(v.id);
                            setShowVoiceMenu(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-pink-500/20 text-white border border-pink-500/40'
                              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-white flex items-center gap-1.5">
                              <span>{v.name}</span>
                              {v.id === 'Aoede' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/30 text-pink-300">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{v.description}</div>
                          </div>
                          {isActive && <Check className="h-4 w-4 text-pink-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Boy Voices Section */}
                <div className="mt-3">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    👦 Boy Voices (Male)
                  </div>
                  <div className="mt-1 space-y-1">
                    {AVAILABLE_VOICES.filter((v) => v.gender === 'boy').map((v) => {
                      const isActive = currentVoice === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            onChangeVoice(v.id);
                            setShowVoiceMenu(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-cyan-500/20 text-white border border-cyan-500/40'
                              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-white flex items-center gap-1.5">
                              <span>{v.name}</span>
                              {v.id === 'Puck' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{v.description}</div>
                          </div>
                          {isActive && <Check className="h-4 w-4 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="relative" ref={volumeMenuRef}>
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${theme.header.controlButton}`}
              aria-label="Adjust sound volume"
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-slate-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 top-11 z-30 w-36 rounded-xl bg-slate-900/95 p-3 shadow-2xl border border-purple-500/30 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Mic Mute Toggle (when connected) */}
          {state !== 'disconnected' && (
            <button
              onClick={onToggleMute}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-rose-950/70 border-rose-600/50 text-rose-300'
                  : theme.header.controlButton
              }`}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfo(true)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${theme.header.controlButton}`}
            aria-label="About Janu"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Info Dialog */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900/95 border border-purple-500/30 p-6 shadow-2xl text-slate-200">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${theme.header.brandBadge}`}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">MAX AI</h3>
                <p className="text-xs text-teal-300">Created by Syed Manan • Bilingual Companion</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              <strong className="text-white">MAX</strong> is a futuristic, witty, and charming AI assistant created by <strong className="text-teal-300">Syed Manan</strong>. Powered by Gemini Live API for real-time audio-to-audio interaction in both English and Hindi.
            </p>

            <div className="space-y-3 rounded-xl bg-slate-950/60 p-4 border border-teal-500/20 text-xs text-slate-300 mb-5">
              <div className="flex items-start gap-2.5">
                <Globe className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Bilingual Spoken Conversations:</span> Seamlessly understands and talks in English, Hindi (हिन्दी), and Hinglish with zero text fallback!
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Radio className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Screen Share Control:</span> Say &ldquo;Share screen&rdquo; or &ldquo;Screen share karo&rdquo; to start streaming your display.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Palette className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Theme & Wallpaper:</span> Ask to &ldquo;Change background to Neon Cyber&rdquo; or switch through the palette menu.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">App & Website Launch:</span> Say &ldquo;Open YouTube&rdquo; or &ldquo;Open GitHub&rdquo; and Everything loads it safely.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 py-2.5 text-center text-sm font-semibold text-white hover:opacity-95 transition-opacity"
            >
              Got it, let&apos;s talk!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
