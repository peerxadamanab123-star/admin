import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Laptop,
  Globe,
  Music,
  Shield,
  X,
  Radio,
  Search,
} from 'lucide-react';
import { HandsFreeState, HandsFreeConfig, CustomVoiceShortcut, WindowsAppInfo } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';
import { DEFAULT_WINDOWS_APPS, DEFAULT_CUSTOM_SHORTCUTS } from '../utils/windowsApps.ts';

interface HandsFreeControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  handsFreeState: HandsFreeState;
  config: HandsFreeConfig;
  onUpdateConfig: (newConfig: Partial<HandsFreeConfig>) => void;
  onToggleHandsFree: () => void;
  onEmergencyStop: () => void;
  customShortcuts: CustomVoiceShortcut[];
  onUpdateShortcuts: (shortcuts: CustomVoiceShortcut[]) => void;
  onTestLaunchApp: (app: string) => Promise<boolean>;
  onTestLaunchUrl: (url: string) => Promise<boolean>;
  theme: ThemeConfig;
}

export const HandsFreeControlPanel: React.FC<HandsFreeControlPanelProps> = ({
  isOpen,
  onClose,
  handsFreeState,
  config,
  onUpdateConfig,
  onToggleHandsFree,
  onEmergencyStop,
  customShortcuts,
  onUpdateShortcuts,
  onTestLaunchApp,
  onTestLaunchUrl,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'apps' | 'shortcuts' | 'windows'>('control');
  const [bridgeStatus, setBridgeStatus] = useState<{ checked: boolean; active: boolean; chromePath?: string }>({
    checked: false,
    active: false,
  });

  // Shortcut form state
  const [newTrigger, setNewTrigger] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newType, setNewType] = useState<'website' | 'app'>('website');

  // Check companion bridge on open
  useEffect(() => {
    if (isOpen) {
      checkBridge();
    }
  }, [isOpen, config.desktopBridgeUrl]);

  const checkBridge = async () => {
    try {
      const res = await fetch(`${config.desktopBridgeUrl || 'http://127.0.0.1:5005'}/health`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const data = await res.json();
        setBridgeStatus({ checked: true, active: true, chromePath: data.chrome_path });
        return;
      }
    } catch (_) {}

    // Check server system status
    try {
      const sRes = await fetch('/api/system/status');
      if (sRes.ok) {
        const sData = await sRes.json();
        setBridgeStatus({
          checked: true,
          active: false,
          chromePath: sData.chromePath,
        });
      }
    } catch (_) {
      setBridgeStatus({ checked: true, active: false });
    }
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newTarget.trim()) return;

    const newShortcut: CustomVoiceShortcut = {
      id: `sc-${Date.now()}`,
      trigger: newTrigger.trim().toLowerCase(),
      target: newTarget.trim(),
      type: newType,
    };

    onUpdateShortcuts([...customShortcuts, newShortcut]);
    setNewTrigger('');
    setNewTarget('');
  };

  const handleDeleteShortcut = (id: string) => {
    onUpdateShortcuts(customShortcuts.filter((s) => s.id !== id));
  };

  if (!isOpen) return null;

  const isHandsFreeActive = handsFreeState !== 'idle' && handsFreeState !== 'paused' && handsFreeState !== 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-950 border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.4)]">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  MAX Hands-Free & Windows Control
                </h3>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  PC Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Voice-control Google Chrome, web searches, songs, and Windows programs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('control')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'control'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Hands-Free Listening</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'apps'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Windows Programs ({DEFAULT_WINDOWS_APPS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'shortcuts'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Voice Shortcuts & College</span>
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'windows'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Bridge Setup</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* TAB 1: HANDS-FREE CONTROLS & STATUS */}
          {activeTab === 'control' && (
            <div className="space-y-5">
              {/* Main Listening Banner */}
              <div
                className={`relative overflow-hidden rounded-2xl p-5 border transition-all ${
                  isHandsFreeActive
                    ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
                        isHandsFreeActive
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isHandsFreeActive ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">
                          Continuous Hands-Free Mode
                        </span>
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isHandsFreeActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Radio className="h-2.5 w-2.5 animate-pulse" />
                          {handsFreeState === 'listening_for_wake_word'
                            ? `Listening for "${config.wakeWord}"`
                            : handsFreeState === 'wake_word_detected'
                            ? 'Wake Word Heard! Awaiting command...'
                            : handsFreeState === 'processing_command'
                            ? 'Processing voice command...'
                            : handsFreeState === 'speaking'
                            ? 'Speaking confirmation...'
                            : handsFreeState === 'paused'
                            ? 'Paused'
                            : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        Say <strong className="text-cyan-300">&ldquo;{config.wakeWord}, open YouTube&rdquo;</strong>,{' '}
                        <strong className="text-cyan-300">&ldquo;{config.wakeWord}, open Calculator&rdquo;</strong>, or{' '}
                        <strong className="text-cyan-300">&ldquo;{config.wakeWord}, search Google for Kashmir University exam dates&rdquo;</strong> without touching the mouse!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={onToggleHandsFree}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                        isHandsFreeActive
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:opacity-95'
                      }`}
                    >
                      {isHandsFreeActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span>{isHandsFreeActive ? 'Pause Hands-Free' : 'Enable Hands-Free'}</span>
                    </button>

                    {isHandsFreeActive && (
                      <button
                        onClick={onEmergencyStop}
                        className="rounded-xl bg-red-600/20 border border-red-500/40 px-3 py-2.5 text-xs font-bold text-red-300 hover:bg-red-600/40 transition-colors"
                        title="Emergency Stop / Mute"
                      >
                        Emergency Stop
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Wake Word & Voice Feedback Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Wake Word Trigger
                  </label>
                  <select
                    value={config.wakeWord}
                    onChange={(e) => onUpdateConfig({ wakeWord: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Hey MAX">Hey MAX (Recommended)</option>
                    <option value="MAX">MAX</option>
                    <option value="Hey Myraa">Hey Myraa</option>
                    <option value="Myraa">Myraa</option>
                    <option value="Suno MAX">Suno MAX (Hindi)</option>
                  </select>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Say this phrase first, then speak your command (or combine them: &ldquo;Hey MAX, open Notepad&rdquo;).
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Spoken AI Confirmations
                    </label>
                    <button
                      onClick={() => onUpdateConfig({ spokenFeedback: !config.spokenFeedback })}
                      className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
                        config.spokenFeedback ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white transition-transform ${
                          config.spokenFeedback ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {config.spokenFeedback ? (
                      <Volume2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-500" />
                    )}
                    <span>
                      {config.spokenFeedback
                        ? 'Speaks confirmation (e.g., "Opening YouTube for you, sir")'
                        : 'Muted confirmations'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Spoken back using natural female AI voice in English, Hindi, and Urdu.
                  </p>
                </div>
              </div>

              {/* Quick Spoken Test Actions */}
              <div className="rounded-2xl bg-slate-900/40 p-4 border border-slate-800/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Try Saying Or Test Clicking:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => onTestLaunchUrl('https://www.youtube.com')}
                    className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-left text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">&ldquo;Hey MAX, open YouTube&rdquo;</div>
                      <div className="text-[10px] text-slate-500">Opens https://www.youtube.com</div>
                    </div>
                    <Play className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() =>
                      onTestLaunchUrl(
                        'https://www.youtube.com/results?search_query=Sociology+first+semester+lectures'
                      )
                    }
                    className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-left text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        &ldquo;Search YouTube for Sociology first semester lectures&rdquo;
                      </div>
                      <div className="text-[10px] text-slate-500">Opens YouTube search results</div>
                    </div>
                    <Search className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() =>
                      onTestLaunchUrl(
                        'https://www.google.com/search?q=Kashmir+University+exam+dates'
                      )
                    }
                    className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-left text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        &ldquo;Search Google for Kashmir University exam dates&rdquo;
                      </div>
                      <div className="text-[10px] text-slate-500">Opens Google search in Chrome</div>
                    </div>
                    <Search className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => onTestLaunchApp('calc.exe')}
                    className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-left text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">&ldquo;Hey MAX, open Calculator&rdquo;</div>
                      <div className="text-[10px] text-slate-500">Launches Windows Calculator</div>
                    </div>
                    <Play className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => onTestLaunchApp('notepad.exe')}
                    className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-left text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">&ldquo;Hey MAX, open Notepad&rdquo;</div>
                      <div className="text-[10px] text-slate-500">Launches Windows Notepad</div>
                    </div>
                    <Play className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() =>
                      onTestLaunchUrl(
                        'https://www.youtube.com/results?search_query=Kesariya+song'
                      )
                    }
                    className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-left text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white">&ldquo;Hey MAX, play song Kesariya&rdquo;</div>
                      <div className="text-[10px] text-slate-500">Plays song on YouTube in Chrome</div>
                    </div>
                    <Music className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUPPORTED WINDOWS PROGRAMS */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Supported Windows Desktop Programs</h4>
                  <p className="text-xs text-slate-400">
                    Say &ldquo;Open [Program Name]&rdquo; to launch immediately on your Windows PC.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_WINDOWS_APPS.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <div className="font-bold text-white text-xs">{app.name}</div>
                        <div className="text-[10px] font-mono text-cyan-300">{app.executable}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          Voice aliases: {app.aliases.join(', ')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onTestLaunchApp(app.executable)}
                      className="rounded-xl bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors shrink-0"
                    >
                      Test Launch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VOICE SHORTCUTS & COLLEGE PORTALS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">Custom Voice Shortcuts</h4>
                <p className="text-xs text-slate-400">
                  Teach MAX custom phrases (e.g. &ldquo;my college&rdquo;, &ldquo;exam dates&rdquo;, &ldquo;my portal&rdquo;) to open any website or app instantly.
                </p>
              </div>

              {/* List of shortcuts */}
              <div className="space-y-2">
                {customShortcuts.map((sc) => (
                  <div
                    key={sc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="text-cyan-400 font-mono">&ldquo;{sc.trigger}&rdquo;</span>
                        <span className="text-[10px] rounded px-1.5 py-0.5 bg-slate-800 text-slate-300 uppercase">
                          {sc.type}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-md">
                        Target: {sc.target}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (sc.type === 'website') onTestLaunchUrl(sc.target);
                          else onTestLaunchApp(sc.target);
                        }}
                        className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-slate-700"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleDeleteShortcut(sc.id)}
                        className="rounded-lg p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Shortcut Form */}
              <form onSubmit={handleAddShortcut} className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  + Add Custom Voice Trigger
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">When I say:</label>
                    <input
                      type="text"
                      placeholder="e.g. college website"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target URL or Program:</label>
                    <input
                      type="text"
                      placeholder="e.g. https://kashmiruniversity.net"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Type:</label>
                    <div className="flex gap-2">
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="website">Website URL</option>
                        <option value="app">Windows App</option>
                      </select>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 font-bold text-xs text-slate-950 hover:opacity-90 transition-opacity"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: WINDOWS PC COMPANION BRIDGE */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Windows PC Desktop Bridge</h4>
                    <p className="text-xs text-slate-400">
                      Enables full OS-level control: opening Google Chrome, Notepad, Calculator, and sending tab shortcuts.
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      bridgeStatus.active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {bridgeStatus.active ? 'Bridge Connected' : 'Native Browser Mode'}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Local Bridge URL:</span>
                    <span className="text-cyan-400">{config.desktopBridgeUrl || 'http://127.0.0.1:5005'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chrome Executable:</span>
                    <span className="text-slate-200 truncate max-w-sm">
                      {bridgeStatus.chromePath || 'chrome.exe'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Mode:</span>
                    <span className="text-emerald-400">Strict Whitelist (Safe)</span>
                  </div>
                </div>

                {/* 3-Step Setup Guide */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-bold text-white">How to run on your Windows PC:</div>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <li>
                      <strong>Option 1 (Instant):</strong> Keep this page open in Google Chrome and enable{' '}
                      <span className="text-cyan-300 font-bold">Continuous Hands-Free Mode</span>. Chrome opens all websites and searches automatically!
                    </li>
                    <li>
                      <strong>Option 2 (Full Windows OS Apps):</strong> In your project folder, double-click{' '}
                      <span className="font-mono text-cyan-300">run_windows_bridge.bat</span> (or run{' '}
                      <span className="font-mono text-slate-300">python max_windows_bridge.py</span>).
                    </li>
                    <li>
                      Done! You can now say <span className="text-white font-bold">&ldquo;Hey MAX, open Notepad&rdquo;</span>,{' '}
                      <span className="text-white font-bold">&ldquo;Hey MAX, open YouTube&rdquo;</span>, or{' '}
                      <span className="text-white font-bold">&ldquo;Hey MAX, play song Kesariya&rdquo;</span> hands-free!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MAX Personal Voice AI • Syed Manan</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 font-bold text-slate-950 hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
