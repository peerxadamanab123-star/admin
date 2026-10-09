/**
 * Everything - Futuristic Voice Assistant
 * Audio-to-audio conversational AI powered by Gemini Live API
 * Created by Mr Manan
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AssistantState,
  ToolExecutionEvent,
  VoiceOption,
  ThemeId,
  ChromeWindowState,
  ChromeActionPayload,
} from './types.ts';
import { THEMES } from './theme/themes.ts';
import { AudioPlayer } from './services/AudioPlayer.ts';
import { AudioStreamer } from './services/AudioStreamer.ts';
import { LiveSession } from './services/LiveSession.ts';
import { ToolManager } from './services/ToolManager.ts';
import { GlassHeader } from './components/GlassHeader.tsx';
import { CentralAssistantControl } from './components/CentralAssistantControl.tsx';
import { ToolExecutionCard } from './components/ToolExecutionCard.tsx';
import { PermissionPrompt } from './components/PermissionPrompt.tsx';
import { ScreenShareCard } from './components/ScreenShareCard.tsx';
import { VoicePrompts } from './components/VoicePrompts.tsx';
import { TimeDateWidget } from './components/TimeDateWidget.tsx';
import { TechUpdatesWidget } from './components/TechUpdatesWidget.tsx';
import { CreatorWidget } from './components/CreatorWidget.tsx';
import { MaxChrome } from './components/MaxChrome.tsx';
import {
  RelocateManager,
  WidgetLayoutConfig,
  DEFAULT_CLEAN_LAYOUT,
} from './components/RelocateManager.tsx';
import { Move } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AssistantState>('disconnected');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [currentVoice, setCurrentVoice] = useState<VoiceOption>(() => {
    try {
      const saved = localStorage.getItem('max_voice') || localStorage.getItem('everything_voice');
      if (
        saved &&
        ['Aoede', 'Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'].includes(saved)
      ) {
        return saved as VoiceOption;
      }
    } catch (_) {}
    return 'Aoede';
  });

  const handleVoiceChange = useCallback((newVoice: VoiceOption) => {
    setCurrentVoice(newVoice);
    try {
      localStorage.setItem('max_voice', newVoice);
    } catch (_) {}
  }, []);

  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('everything_theme') || localStorage.getItem('janu_theme');
      if (
        saved &&
        (saved === 'heavy-emerald' ||
          saved === 'midnight-blue' ||
          saved === 'neon-cyber' ||
          saved === 'pure-minimalist' ||
          saved === 'sakura-anime')
      ) {
        return saved as ThemeId;
      }
    } catch (_) {}
    return 'heavy-emerald';
  });
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [activeToolEvent, setActiveToolEvent] = useState<ToolExecutionEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MAX Chrome browser window state
  const [chromeWindowState, setChromeWindowState] = useState<ChromeWindowState>('closed');
  const [chromeInitialUrl, setChromeInitialUrl] = useState<string | undefined>(undefined);
  const [chromeInitialSearch, setChromeInitialSearch] = useState<string | undefined>(undefined);

  const handleOpenChrome = useCallback((payload?: ChromeActionPayload) => {
    setChromeWindowState((prev) => (prev === 'closed' || prev === 'minimized' ? 'normal' : prev));
    if (payload?.url) {
      setChromeInitialUrl(payload.url);
    }
    if (payload?.search) {
      setChromeInitialSearch(payload.search);
    }
  }, []);

  const handleCloseChrome = useCallback(() => {
    setChromeWindowState('closed');
    setChromeInitialUrl(undefined);
    setChromeInitialSearch(undefined);
  }, []);

  // Widget Layout & Relocate state (Clean by default: removes widgets from canvas)
  const [layoutConfig, setLayoutConfig] = useState<WidgetLayoutConfig>(() => {
    try {
      const saved = localStorage.getItem('everything_layout');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_CLEAN_LAYOUT;
  });
  const [isRelocateOpen, setIsRelocateOpen] = useState(false);

  const handleUpdateLayout = useCallback((newConfig: WidgetLayoutConfig) => {
    setLayoutConfig(newConfig);
    try {
      localStorage.setItem('everything_layout', JSON.stringify(newConfig));
    } catch (_) {}
  }, []);

  const handleRelocateAction = useCallback(
    (action: string) => {
      if (action === 'clean') {
        handleUpdateLayout(DEFAULT_CLEAN_LAYOUT);
      } else if (action === 'corners') {
        handleUpdateLayout({
          preset: 'corners',
          creatorPos: 'top',
          timeDatePos: 'bottom-left',
          techUpdatesPos: 'bottom-right',
          promptsPos: 'hidden',
          avatarPos: 'center',
        });
      } else if (action === 'wings') {
        handleUpdateLayout({
          preset: 'wings',
          creatorPos: 'top',
          timeDatePos: 'left',
          techUpdatesPos: 'right',
          promptsPos: 'bottom',
          avatarPos: 'center',
        });
      } else {
        setIsRelocateOpen(true);
      }
    },
    [handleUpdateLayout]
  );

  const activeTheme = THEMES[currentTheme] || THEMES['heavy-emerald'];

  const handleThemeChange = useCallback((newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem('everything_theme', newTheme);
    } catch (_) {}
  }, []);

  // Screen share controls
  const handleStartScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setScreenStream(null);
      });
      setScreenStream(stream);
      return { success: true };
    } catch (err: any) {
      console.warn('Screen share cancelled/failed:', err);
      return {
        success: false,
        error: err?.message || 'Screen share was cancelled or denied by user.',
      };
    }
  }, []);

  const handleStopScreenShare = useCallback(() => {
    setScreenStream((prev) => {
      if (prev) {
        prev.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
  }, []);

  const handleCloseApplication = useCallback(
    (target?: string) => {
      if (target === 'screenshare' || target === 'all') {
        handleStopScreenShare();
      }
      if (target === 'card' || target === 'all') {
        setActiveToolEvent(null);
      }
      if (target === 'chrome' || target === 'all') {
        handleCloseChrome();
      }
      if (target === 'all') {
        setErrorMessage(null);
      }
    },
    [handleStopScreenShare, handleCloseChrome]
  );

  // Service singletons
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const toolManagerRef = useRef<ToolManager | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null);

  // Animation frame ref for speaking audio levels
  const animFrameRef = useRef<number | null>(null);

  // Initialize service singletons once
  useEffect(() => {
    // 1. Tool Manager
    const toolManager = new ToolManager((event) => {
      setActiveToolEvent(event);
    });
    toolManagerRef.current = toolManager;

    // 2. Audio Player (24kHz Web Audio)
    const audioPlayer = new AudioPlayer((isPlaying) => {
      setState((prevState) => {
        if (prevState === 'disconnected' || prevState === 'connecting') return prevState;
        return isPlaying ? 'speaking' : 'listening';
      });
    });
    audioPlayerRef.current = audioPlayer;

    // 3. Audio Streamer (16kHz Mic capture)
    const audioStreamer = new AudioStreamer();
    audioStreamerRef.current = audioStreamer;

    // 4. Live Session (Gemini Live API WebSocket)
    const liveSession = new LiveSession(audioPlayer, toolManager, {
      onStateChange: (newState) => {
        setState(newState);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onLatencyUpdate: (lat) => {
        setLatencyMs(lat);
      },
    });
    liveSessionRef.current = liveSession;

    return () => {
      audioPlayer.close();
      audioStreamer.stop();
      liveSession.disconnect();
    };
  }, []);

  // Keep ToolManager action handlers in sync with reactive state
  useEffect(() => {
    if (toolManagerRef.current) {
      toolManagerRef.current.setHandlers({
        onChangeTheme: handleThemeChange,
        onStartScreenShare: handleStartScreenShare,
        onStopScreenShare: handleStopScreenShare,
        onCloseApplication: handleCloseApplication,
        onRelocateWidgets: handleRelocateAction,
        onChangeVoice: handleVoiceChange,
        onOpenChrome: (payload) => {
          handleOpenChrome(payload);
        },
        onCloseChrome: handleCloseChrome,
        onSetChromeWindowState: (state) => {
          setChromeWindowState(state);
        },
      });
    }
  }, [
    handleThemeChange,
    handleStartScreenShare,
    handleStopScreenShare,
    handleCloseApplication,
    handleRelocateAction,
    handleVoiceChange,
    handleOpenChrome,
    handleCloseChrome,
  ]);

  // Update volume on audio player
  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    audioPlayerRef.current?.setVolume(newVol);
  }, []);

  // Toggle mic mute
  const handleToggleMute = useCallback(() => {
    if (audioStreamerRef.current) {
      const nextMuted = !audioStreamerRef.current.isMuted();
      audioStreamerRef.current.setMuted(nextMuted);
      setIsMuted(nextMuted);
    }
  }, []);

  // Monitor speaking audio level when Janu is talking
  useEffect(() => {
    if (state === 'speaking') {
      const updateLevel = () => {
        if (audioPlayerRef.current) {
          const lvl = audioPlayerRef.current.getAudioLevel();
          setAudioLevel(lvl);
        }
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      animFrameRef.current = requestAnimationFrame(updateLevel);
    } else if (state === 'disconnected') {
      setAudioLevel(0);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state]);

  // Start or Stop Session
  const handleToggleSession = useCallback(async () => {
    setErrorMessage(null);

    // If active, disconnect
    if (state !== 'disconnected') {
      audioStreamerRef.current?.stop();
      audioPlayerRef.current?.interrupt();
      liveSessionRef.current?.disconnect();
      setState('disconnected');
      setAudioLevel(0);
      return;
    }

    // Otherwise, start session
    setState('connecting');

    try {
      if (!liveSessionRef.current || !audioStreamerRef.current || !audioPlayerRef.current) {
        throw new Error('Audio engines not initialized.');
      }

      // Connect to Gemini Live API
      await liveSessionRef.current.connect(currentVoice);

      // Start capturing mic audio and streaming
      await audioStreamerRef.current.start(
        (base64Chunk) => {
          liveSessionRef.current?.sendAudio(base64Chunk);
        },
        (micLevel) => {
          // When in listening mode, update audioLevel to mic input level
          setState((currentState) => {
            if (currentState === 'listening') {
              setAudioLevel(micLevel);
            }
            return currentState;
          });
        }
      );
    } catch (err: any) {
      console.error('Failed to start session:', err);
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access to talk to Everything.'
          : err?.message || 'Could not connect to Everything. Please check your network and try again.';
      setErrorMessage(msg);
      setState('disconnected');
    }
  }, [state, currentVoice]);

  // Barge-in (Interruption while speaking)
  const handleInterrupt = useCallback(() => {
    if (state === 'speaking') {
      audioPlayerRef.current?.interrupt();
      liveSessionRef.current?.sendBargeIn();
      setState('listening');
    }
  }, [state]);

  return (
    <div className={`relative flex min-h-screen w-full flex-col overflow-hidden text-slate-100 font-sans selection:bg-teal-500 selection:text-white transition-colors duration-700 ${activeTheme.bgClass}`}>
      {/* Heavy Immersive Atmospheric Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Deep dark obsidian base with heavy atmospheric depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020509] via-[#040810] to-[#010306]" />

        {/* Heavy Overhead Volumetric Spotlight Beam focused onto the character */}
        <div
          className="absolute inset-x-0 -top-20 h-[680px] opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(45, 212, 191, 0.22) 0%, rgba(20, 184, 166, 0.08) 45%, transparent 80%)',
          }}
        />

        {/* Heavy Bottom Stage Radial Reflection Glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-[480px] opacity-85"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 100%, rgba(13, 148, 136, 0.28) 0%, rgba(4, 47, 46, 0.16) 45%, transparent 85%)',
          }}
        />

        {/* Volumetric Floating Ambient Glow Orbs */}
        <div className={`absolute -left-36 top-16 h-[500px] w-[500px] rounded-full blur-[150px] transition-colors duration-700 ${activeTheme.ambientGlows.orb1}`} />
        <div className={`absolute -right-36 top-1/4 h-[520px] w-[520px] rounded-full blur-[160px] transition-colors duration-700 ${activeTheme.ambientGlows.orb2}`} />
        <div className={`absolute bottom-16 left-1/4 h-[440px] w-[440px] rounded-full blur-[150px] transition-colors duration-700 ${activeTheme.ambientGlows.orb3}`} />

        {/* Heavy Studio Dark Vignette (Intense Cinematic Shadow Ring) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 48%, transparent 35%, rgba(0, 0, 0, 0.8) 85%, rgba(0, 0, 0, 0.98) 100%)',
          }}
        />

        {/* Heavy Geometric Floor Matrix Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1.2px, transparent 1.2px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Header */}
      <GlassHeader
        state={state}
        latencyMs={latencyMs}
        isMuted={isMuted}
        volume={volume}
        currentVoice={currentVoice}
        theme={activeTheme}
        currentTheme={currentTheme}
        onToggleMute={handleToggleMute}
        onChangeVolume={handleVolumeChange}
        onChangeVoice={handleVoiceChange}
        onChangeTheme={handleThemeChange}
        onOpenRelocate={() => setIsRelocateOpen(true)}
        onOpenChrome={() => handleOpenChrome()}
        isChromeOpen={chromeWindowState !== 'closed'}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-between px-3 sm:px-6 pb-6 pt-2 w-full max-w-7xl mx-auto">
        {/* Permission and Error Alerts */}
        <PermissionPrompt
          error={errorMessage}
          onRetry={handleToggleSession}
          onDismiss={() => setErrorMessage(null)}
        />

        {/* Creator Widget with "CREATOR" written above and "SYED MANAN" (When relocated to Top) */}
        {layoutConfig.creatorPos === 'top' && (
          <div className="w-full flex justify-center pt-1 pb-2 animate-in fade-in duration-300">
            <CreatorWidget
              theme={activeTheme}
              onRelocate={() => setIsRelocateOpen(true)}
              onClose={() =>
                handleUpdateLayout({ ...layoutConfig, creatorPos: 'hidden', preset: 'custom' })
              }
            />
          </div>
        )}

        {/* Cyber Deck Grid: Center Focus with Relocatable Side Widgets */}
        <div
          className={`my-auto w-full flex flex-col lg:flex-row items-center gap-6 px-2 sm:px-4 ${
            layoutConfig.avatarPos === 'left'
              ? 'justify-start'
              : layoutConfig.avatarPos === 'right'
              ? 'justify-end'
              : 'justify-center'
          }`}
        >
          {/* Left Wing / Relocated: Time and Date Widget */}
          {layoutConfig.timeDatePos === 'left' && (
            <div className="w-full sm:w-auto flex justify-center lg:justify-end order-2 lg:order-1 animate-in fade-in duration-300">
              <TimeDateWidget
                theme={activeTheme}
                onRelocate={() => setIsRelocateOpen(true)}
                onClose={() =>
                  handleUpdateLayout({ ...layoutConfig, timeDatePos: 'hidden', preset: 'custom' })
                }
              />
            </div>
          )}

          {/* Center: Central Assistant Control with Anime Girl & Glowing Cyber Holo Circle */}
          <div className="flex flex-col items-center justify-center order-1 lg:order-2 shrink-0">
            <CentralAssistantControl
              state={state}
              audioLevel={audioLevel}
              isMuted={isMuted}
              theme={activeTheme}
              isScreenSharing={!!screenStream}
              currentVoice={currentVoice}
              onChangeVoice={handleVoiceChange}
              onToggleSession={handleToggleSession}
              onInterrupt={handleInterrupt}
              onToggleScreenShare={screenStream ? handleStopScreenShare : handleStartScreenShare}
            />
          </div>

          {/* Right Wing / Relocated: AI Information and Tech Updates Widget */}
          {layoutConfig.techUpdatesPos === 'right' && (
            <div className="w-full sm:w-auto flex justify-center lg:justify-start order-3 animate-in fade-in duration-300">
              <TechUpdatesWidget
                state={state}
                latencyMs={latencyMs}
                theme={activeTheme}
                onRelocate={() => setIsRelocateOpen(true)}
                onClose={() =>
                  handleUpdateLayout({ ...layoutConfig, techUpdatesPos: 'hidden', preset: 'custom' })
                }
              />
            </div>
          )}
        </div>

        {/* Creator Widget at Bottom (When relocated to bottom) */}
        {layoutConfig.creatorPos === 'bottom' && (
          <div className="w-full flex justify-center pt-2 pb-1 animate-in fade-in duration-300">
            <CreatorWidget
              theme={activeTheme}
              onRelocate={() => setIsRelocateOpen(true)}
              onClose={() =>
                handleUpdateLayout({ ...layoutConfig, creatorPos: 'hidden', preset: 'custom' })
              }
            />
          </div>
        )}

        {/* Voice Command & Bilingual Suggestions (When enabled) */}
        {layoutConfig.promptsPos === 'bottom' && (
          <div className="w-full flex justify-center mt-2 sm:mt-3 animate-in fade-in duration-300">
            <VoicePrompts theme={activeTheme} />
          </div>
        )}
      </main>

      {/* Relocated Corner Widgets (When corners or specific positions are chosen) */}
      {layoutConfig.timeDatePos === 'bottom-left' && (
        <div className="fixed bottom-4 left-4 z-20 hidden md:block animate-in fade-in duration-300">
          <TimeDateWidget
            theme={activeTheme}
            onRelocate={() => setIsRelocateOpen(true)}
            onClose={() =>
              handleUpdateLayout({ ...layoutConfig, timeDatePos: 'hidden', preset: 'custom' })
            }
          />
        </div>
      )}
      {layoutConfig.timeDatePos === 'top-right' && (
        <div className="fixed top-20 right-4 z-20 hidden md:block animate-in fade-in duration-300">
          <TimeDateWidget
            theme={activeTheme}
            onRelocate={() => setIsRelocateOpen(true)}
            onClose={() =>
              handleUpdateLayout({ ...layoutConfig, timeDatePos: 'hidden', preset: 'custom' })
            }
          />
        </div>
      )}

      {layoutConfig.techUpdatesPos === 'bottom-right' && (
        <div className="fixed bottom-4 right-4 z-20 hidden md:block animate-in fade-in duration-300">
          <TechUpdatesWidget
            state={state}
            latencyMs={latencyMs}
            theme={activeTheme}
            onRelocate={() => setIsRelocateOpen(true)}
            onClose={() =>
              handleUpdateLayout({ ...layoutConfig, techUpdatesPos: 'hidden', preset: 'custom' })
            }
          />
        </div>
      )}
      {layoutConfig.techUpdatesPos === 'top-left' && (
        <div className="fixed top-20 left-4 z-20 hidden md:block animate-in fade-in duration-300">
          <TechUpdatesWidget
            state={state}
            latencyMs={latencyMs}
            theme={activeTheme}
            onRelocate={() => setIsRelocateOpen(true)}
            onClose={() =>
              handleUpdateLayout({ ...layoutConfig, techUpdatesPos: 'hidden', preset: 'custom' })
            }
          />
        </div>
      )}

      {/* Floating Quick Relocate Pill */}
      <button
        onClick={() => setIsRelocateOpen(true)}
        className="fixed bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1.5 text-[11px] font-semibold text-slate-300 border border-purple-500/35 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.7)] hover:border-cyan-400 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Relocate Widgets & Layout Options"
      >
        <Move className="h-3 w-3 text-cyan-400 animate-pulse" />
        <span>Relocate</span>
      </button>

      {/* Relocate Manager Modal */}
      <RelocateManager
        isOpen={isRelocateOpen}
        onClose={() => setIsRelocateOpen(false)}
        config={layoutConfig}
        onChangeConfig={handleUpdateLayout}
        theme={activeTheme}
      />

      {/* Screen Sharing Picture-in-Picture / Floating Display */}
      <ScreenShareCard
        stream={screenStream}
        theme={activeTheme}
        onStop={handleStopScreenShare}
      />

      {/* Floating Tool Execution Result Card (e.g. Website opened) */}
      <ToolExecutionCard
        event={activeToolEvent}
        theme={activeTheme}
        onDismiss={() => setActiveToolEvent(null)}
      />

      {/* MAX's Own Chrome Browser Window */}
      <MaxChrome
        isOpen={chromeWindowState !== 'closed'}
        windowState={chromeWindowState}
        onClose={handleCloseChrome}
        onWindowStateChange={setChromeWindowState}
        initialUrl={chromeInitialUrl}
        initialSearch={chromeInitialSearch}
        theme={activeTheme}
      />
    </div>
  );
}
