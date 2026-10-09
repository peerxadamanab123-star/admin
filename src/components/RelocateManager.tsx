import React from 'react';
import {
  Move,
  LayoutGrid,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Cpu,
  Crown,
  MessageSquare,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { ThemeConfig } from '../theme/themes.ts';

export type PresetMode = 'clean' | 'corners' | 'wings' | 'custom';

export type CreatorPos = 'hidden' | 'top' | 'header' | 'bottom';
export type TimeDatePos = 'hidden' | 'left' | 'top-right' | 'bottom-left';
export type TechUpdatesPos = 'hidden' | 'right' | 'top-left' | 'bottom-right';
export type PromptsPos = 'hidden' | 'bottom';
export type AvatarPos = 'center' | 'left' | 'right';

export interface WidgetLayoutConfig {
  preset: PresetMode;
  creatorPos: CreatorPos;
  timeDatePos: TimeDatePos;
  techUpdatesPos: TechUpdatesPos;
  promptsPos: PromptsPos;
  avatarPos: AvatarPos;
}

export const DEFAULT_CLEAN_LAYOUT: WidgetLayoutConfig = {
  preset: 'clean',
  creatorPos: 'hidden',
  timeDatePos: 'hidden',
  techUpdatesPos: 'hidden',
  promptsPos: 'hidden',
  avatarPos: 'center',
};

interface RelocateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetLayoutConfig;
  onChangeConfig: (newConfig: WidgetLayoutConfig) => void;
  theme: ThemeConfig;
}

export const RelocateManager: React.FC<RelocateManagerProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  theme,
}) => {
  if (!isOpen) return null;

  const applyPreset = (preset: PresetMode) => {
    if (preset === 'clean') {
      onChangeConfig({
        preset: 'clean',
        creatorPos: 'hidden',
        timeDatePos: 'hidden',
        techUpdatesPos: 'hidden',
        promptsPos: 'hidden',
        avatarPos: 'center',
      });
    } else if (preset === 'corners') {
      onChangeConfig({
        preset: 'corners',
        creatorPos: 'top',
        timeDatePos: 'bottom-left',
        techUpdatesPos: 'bottom-right',
        promptsPos: 'hidden',
        avatarPos: 'center',
      });
    } else if (preset === 'wings') {
      onChangeConfig({
        preset: 'wings',
        creatorPos: 'top',
        timeDatePos: 'left',
        techUpdatesPos: 'right',
        promptsPos: 'bottom',
        avatarPos: 'center',
      });
    } else {
      onChangeConfig({
        ...config,
        preset: 'custom',
      });
    }
  };

  const updateField = <K extends keyof WidgetLayoutConfig>(
    key: K,
    val: WidgetLayoutConfig[K]
  ) => {
    onChangeConfig({
      ...config,
      [key]: val,
      preset: 'custom',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-purple-500/30 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-pink-500/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Move className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Relocate & Layout Options</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                  Customizer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose clean anime focus or relocate widgets anywhere on screen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
            aria-label="Close relocate menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-2.5">
            <LayoutGrid className="h-3.5 w-3.5 text-pink-400" />
            <span>Layout Presets</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Clean Preset (Default) */}
            <button
              onClick={() => applyPreset('clean')}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                config.creatorPos === 'hidden' &&
                config.timeDatePos === 'hidden' &&
                config.techUpdatesPos === 'hidden' &&
                config.promptsPos === 'hidden'
                  ? 'bg-gradient-to-br from-teal-950/70 to-emerald-950/70 border-teal-400/60 shadow-[0_0_20px_rgba(20,184,166,0.3)] ring-1 ring-teal-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                  Clean Focus
                </span>
                {config.creatorPos === 'hidden' &&
                  config.timeDatePos === 'hidden' &&
                  config.techUpdatesPos === 'hidden' &&
                  config.promptsPos === 'hidden' && (
                    <Check className="h-3.5 w-3.5 text-teal-400" />
                  )}
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                All widgets removed. Pure anime companion & holo circle!
              </span>
            </button>

            {/* Corners Preset */}
            <button
              onClick={() => applyPreset('corners')}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                config.preset === 'corners'
                  ? 'bg-gradient-to-br from-purple-950/70 to-indigo-950/70 border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-purple-400" />
                  Relocated Corners
                </span>
                {config.preset === 'corners' && (
                  <Check className="h-3.5 w-3.5 text-purple-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                Compact widgets relocated to the outer screen corners
              </span>
            </button>

            {/* Wings Preset */}
            <button
              onClick={() => applyPreset('wings')}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
                config.preset === 'wings'
                  ? 'bg-gradient-to-br from-cyan-950/70 to-blue-950/70 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
                  Side Wings
                </span>
                {config.preset === 'wings' && (
                  <Check className="h-3.5 w-3.5 text-cyan-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                Time and Tech updates docked at left and right sides
              </span>
            </button>
          </div>
        </div>

        {/* Individual Widget Relocation Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Relocate Individual Elements
            </span>
            <button
              onClick={() => applyPreset('clean')}
              className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Remove All Widgets</span>
            </button>
          </div>

          {/* 1. Time & Date Widget */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Time & Date Widget</span>
              </div>
              <button
                onClick={() =>
                  updateField(
                    'timeDatePos',
                    config.timeDatePos === 'hidden' ? 'left' : 'hidden'
                  )
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  config.timeDatePos !== 'hidden'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {config.timeDatePos !== 'hidden' ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Shown</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Removed</span>
                  </>
                )}
              </button>
            </div>
            {config.timeDatePos !== 'hidden' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Relocate to:</span>
                {[
                  { id: 'left', label: 'Left Wing' },
                  { id: 'top-right', label: 'Top-Right' },
                  { id: 'bottom-left', label: 'Bottom-Left' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateField('timeDatePos', item.id as TimeDatePos)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                      config.timeDatePos === item.id
                        ? 'bg-cyan-950 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. AI Tech Updates Widget */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-pink-400" />
                <span className="text-xs font-bold text-white">AI Info & Tech Updates</span>
              </div>
              <button
                onClick={() =>
                  updateField(
                    'techUpdatesPos',
                    config.techUpdatesPos === 'hidden' ? 'right' : 'hidden'
                  )
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  config.techUpdatesPos !== 'hidden'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {config.techUpdatesPos !== 'hidden' ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Shown</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Removed</span>
                  </>
                )}
              </button>
            </div>
            {config.techUpdatesPos !== 'hidden' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Relocate to:</span>
                {[
                  { id: 'right', label: 'Right Wing' },
                  { id: 'top-left', label: 'Top-Left' },
                  { id: 'bottom-right', label: 'Bottom-Right' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      updateField('techUpdatesPos', item.id as TechUpdatesPos)
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                      config.techUpdatesPos === item.id
                        ? 'bg-pink-950 text-pink-200 border-pink-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Creator Widget (SYED MANAN) */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-bold text-white">
                  Creator Badge (SYED MANAN)
                </span>
              </div>
              <button
                onClick={() =>
                  updateField(
                    'creatorPos',
                    config.creatorPos === 'hidden' ? 'top' : 'hidden'
                  )
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  config.creatorPos !== 'hidden'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {config.creatorPos !== 'hidden' ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Shown</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Removed</span>
                  </>
                )}
              </button>
            </div>
            {config.creatorPos !== 'hidden' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Relocate to:</span>
                {[
                  { id: 'top', label: 'Top Banner' },
                  { id: 'bottom', label: 'Bottom Bar' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateField('creatorPos', item.id as CreatorPos)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                      config.creatorPos === item.id
                        ? 'bg-amber-950 text-amber-200 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Voice Prompts */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <div>
                <span className="text-xs font-bold text-white block">Voice Suggestions</span>
                <span className="text-[10px] text-slate-400">Bottom conversational chips</span>
              </div>
            </div>
            <button
              onClick={() =>
                updateField(
                  'promptsPos',
                  config.promptsPos === 'hidden' ? 'bottom' : 'hidden'
                )
              }
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                config.promptsPos !== 'hidden'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {config.promptsPos !== 'hidden' ? (
                <>
                  <Eye className="h-3 w-3" />
                  <span>Shown</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  <span>Removed</span>
                </>
              )}
            </button>
          </div>

          {/* 5. Avatar Alignment */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-teal-400" />
              <div>
                <span className="text-xs font-bold text-white block">Avatar Position</span>
                <span className="text-[10px] text-slate-400">Relocate center focus</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(['left', 'center', 'right'] as AvatarPos[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => updateField('avatarPos', pos)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono capitalize transition-all border ${
                    config.avatarPos === pos
                      ? 'bg-teal-950 text-teal-200 border-teal-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>Changes apply live immediately</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-xs font-bold text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:scale-105 active:scale-95 transition-all"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
