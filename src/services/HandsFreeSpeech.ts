/**
 * HandsFreeSpeech
 * Continuous Hands-Free Voice Recognition & Natural Spoken Confirmations
 * Listens for wake words (e.g., "Hey MAX", "MAX", "Myraa") and executes
 * Windows program launches, Chrome website openings, searches, and song playback.
 */
import { HandsFreeState, HandsFreeConfig, CustomVoiceShortcut, WindowsAppInfo } from '../types.ts';
import {
  DEFAULT_WINDOWS_APPS,
  findMatchingApp,
  findMatchingWebsite,
  buildYouTubeSearchUrl,
  buildGoogleSearchUrl,
  DEFAULT_CUSTOM_SHORTCUTS,
} from '../utils/windowsApps.ts';

export interface HandsFreeCallbacks {
  onStateChange: (state: HandsFreeState) => void;
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onCommandRecognized: (command: string, actionType: string, details?: any) => void;
  onError: (error: string) => void;
}

export class HandsFreeSpeech {
  private recognition: any = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isSpeaking: boolean = false;
  private state: HandsFreeState = 'idle';
  private config: HandsFreeConfig;
  private callbacks: HandsFreeCallbacks;
  private customShortcuts: CustomVoiceShortcut[] = DEFAULT_CUSTOM_SHORTCUTS;
  private appsList: WindowsAppInfo[] = DEFAULT_WINDOWS_APPS;
  private restartTimeout: number | null = null;
  private conversationTimeout: number | null = null;
  private isAwaitingCommandAfterWakeWord: boolean = false;
  private selectedSpeechVoice: SpeechSynthesisVoice | null = null;

  constructor(config: HandsFreeConfig, callbacks: HandsFreeCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.initVoiceSynthesis();
  }

  public updateConfig(newConfig: Partial<HandsFreeConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initVoiceSynthesis();
  }

  public updateCustomShortcuts(shortcuts: CustomVoiceShortcut[]) {
    this.customShortcuts = shortcuts;
  }

  public updateAppsList(apps: WindowsAppInfo[]) {
    this.appsList = apps;
  }

  private initVoiceSynthesis() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high-quality female English / Hindi voice
      const femaleVoices = voices.filter((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('female') ||
          name.includes('zira') ||
          name.includes('samantha') ||
          name.includes('kore') ||
          name.includes('natural') ||
          name.includes('google us english') ||
          name.includes('google uk english female') ||
          name.includes('victoria') ||
          name.includes('swara') ||
          name.includes('kalpana')
        );
      });

      if (femaleVoices.length > 0) {
        this.selectedSpeechVoice = femaleVoices[0];
      } else {
        // Fallback to first English or first voice
        const enVoice = voices.find((v) => v.lang.startsWith('en'));
        this.selectedSpeechVoice = enVoice || voices[0];
      }
    };

    findVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  /**
   * Speak response using natural female AI voice with feedback
   */
  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.config.spokenFeedback || typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedSpeechVoice) {
          utterance.voice = this.selectedSpeechVoice;
        }
        utterance.rate = 1.05;
        utterance.pitch = 1.1; // Gentle natural pitch

        this.isSpeaking = true;
        this.setState('speaking');

        utterance.onend = () => {
          this.isSpeaking = false;
          if (this.isRunning && !this.isPaused) {
            this.setState('listening_for_wake_word');
          }
          resolve();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          if (this.isRunning && !this.isPaused) {
            this.setState('listening_for_wake_word');
          }
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        this.isSpeaking = false;
        resolve();
      }
    });
  }

  /**
   * Start continuous hands-free speech recognition
   */
  public start(): boolean {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      this.callbacks.onError('Web Speech API is not supported in this browser. Please use Google Chrome or Edge.');
      this.setState('error');
      return false;
    }

    if (this.isRunning) {
      return true;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isRunning = true;
        this.isPaused = false;
        this.setState('listening_for_wake_word');
      };

      this.recognition.onresult = (event: any) => {
        // Do not process speech while assistant is talking to avoid echo
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        if (interimTranscript) {
          this.callbacks.onTranscript(interimTranscript, false);
        }

        if (finalTranscript) {
          this.callbacks.onTranscript(finalTranscript, true);
          this.handleSpokenInput(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[HandsFreeSpeech] SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.callbacks.onError('Microphone permission was not granted. Please allow microphone in Chrome settings.');
          this.setState('error');
          this.stop();
        } else if (event.error === 'network') {
          this.scheduleRestart(2000);
        }
      };

      this.recognition.onend = () => {
        // SpeechRecognition frequently stops after silence in browsers; auto-restart if still enabled
        if (this.isRunning && !this.isPaused) {
          this.scheduleRestart(300);
        } else {
          this.setState('idle');
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('[HandsFreeSpeech] Failed to start recognition:', err);
      this.callbacks.onError(err?.message || 'Could not start hands-free microphone.');
      this.setState('error');
      return false;
    }
  }

  private scheduleRestart(delayMs = 400) {
    if (this.restartTimeout !== null) {
      clearTimeout(this.restartTimeout);
    }
    this.restartTimeout = window.setTimeout(() => {
      if (this.isRunning && !this.isPaused) {
        try {
          this.recognition?.start();
        } catch (_) {}
      }
    }, delayMs);
  }

  public pause() {
    this.isPaused = true;
    window.speechSynthesis?.cancel();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.setState('paused');
  }

  public resume() {
    this.isPaused = false;
    this.start();
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.conversationTimeout) {
      clearTimeout(this.conversationTimeout);
      this.conversationTimeout = null;
    }
    window.speechSynthesis?.cancel();
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
    this.setState('idle');
  }

  public getState(): HandsFreeState {
    return this.state;
  }

  private setState(newState: HandsFreeState) {
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  /**
   * Main Voice Intent Classifier & Dispatcher
   */
  private async handleSpokenInput(rawText: string) {
    const text = rawText.trim().toLowerCase();
    if (!text) return;

    // Emergency stop / Silence voice commands
    if (
      text.includes('emergency stop') ||
      text === 'stop' ||
      text === 'pause listening' ||
      text === 'chup ho jao' ||
      text === 'max stop' ||
      text === 'stop listening'
    ) {
      await this.speak('Stopping voice recognition, sir.');
      this.pause();
      return;
    }

    const wakeWords = [
      (this.config.wakeWord || 'hey max').toLowerCase(),
      'hey max',
      'max',
      'hey myraa',
      'myraa',
      'suno max',
      'sun max',
    ];

    let matchedWakeWord: string | null = null;
    let commandBody = text;

    for (const w of wakeWords) {
      if (text.startsWith(w)) {
        matchedWakeWord = w;
        commandBody = text.slice(w.length).trim();
        // Remove trailing commas or punctuation from wake word
        commandBody = commandBody.replace(/^[,\.\?!:\s]+/, '');
        break;
      }
    }

    // If we were already waiting for a command from previous wake-word hit
    if (!matchedWakeWord && this.isAwaitingCommandAfterWakeWord) {
      commandBody = text;
      matchedWakeWord = 'in-conversation';
    }

    // If no wake word and not in active conversation window, ignore background chatter
    if (!matchedWakeWord) {
      return;
    }

    // If only wake word was spoken with no command (e.g. "Hey MAX")
    if (!commandBody) {
      this.isAwaitingCommandAfterWakeWord = true;
      this.setState('wake_word_detected');

      // Keep waiting for command for next 8 seconds
      if (this.conversationTimeout) clearTimeout(this.conversationTimeout);
      this.conversationTimeout = window.setTimeout(() => {
        this.isAwaitingCommandAfterWakeWord = false;
        if (this.state === 'wake_word_detected') {
          this.setState('listening_for_wake_word');
        }
      }, 8000);

      await this.speak('Yes sir, I am listening! How can I help you?');
      return;
    }

    // We have a full command!
    this.isAwaitingCommandAfterWakeWord = false;
    if (this.conversationTimeout) clearTimeout(this.conversationTimeout);
    this.setState('processing_command');

    await this.processCommand(commandBody);
  }

  /**
   * Parse and execute command
   */
  private async processCommand(command: string) {
    let clean = command
      .replace(/^(please|kripya|meherbaani|can you|could you)\s+/i, '')
      .replace(/\s+(please|sir|karo|kijiye)$/i, '')
      .trim();

    // 1. Check Custom Voice Shortcuts first
    for (const sc of this.customShortcuts) {
      if (clean.includes(sc.trigger.toLowerCase())) {
        if (sc.type === 'website') {
          this.callbacks.onCommandRecognized(clean, 'custom_shortcut_website', { url: sc.target });
          await this.speak(`Opening ${sc.trigger} for you, sir.`);
          await this.dispatchLaunchChrome(sc.target);
          return;
        } else {
          this.callbacks.onCommandRecognized(clean, 'custom_shortcut_app', { app: sc.target });
          await this.speak(`Launching ${sc.trigger} for you, sir.`);
          await this.dispatchLaunchApp(sc.target);
          return;
        }
      }
    }

    // 2. Play Song Commands (e.g. "play song Kesariya", "play Believer on YouTube", "gaana bajao...")
    const songMatch =
      clean.match(/^(play\s+song|play\s+music|play|bajao|chalao)\s+(.+)/i) ||
      clean.match(/(.+)\s+(song\s+play\s+karo|gaana\s+chalao|play\s+karo)/i);

    if (songMatch && !clean.startsWith('open ') && !clean.startsWith('launch ')) {
      const songName = (songMatch[2] || songMatch[1]).replace(/\s+(on\s+youtube|youtube\s+pe)$/i, '').trim();
      if (songName) {
        this.callbacks.onCommandRecognized(clean, 'play_song', { song: songName });
        await this.speak(`Playing ${songName} on YouTube for you, sir.`);
        const youtubeUrl = buildYouTubeSearchUrl(songName, true);
        await this.dispatchLaunchChrome(youtubeUrl);
        return;
      }
    }

    // 3. YouTube Search Commands (e.g. "search YouTube for Sociology first semester lectures")
    const ytSearchMatch =
      clean.match(/^search\s+(youtube|you\s+tube)\s+(for\s+)?(.+)/i) ||
      clean.match(/^youtube\s+(pe\s+search\s+karo|search)\s+(for\s+)?(.+)/i);

    if (ytSearchMatch) {
      const query = (ytSearchMatch[3] || '').trim();
      if (query) {
        this.callbacks.onCommandRecognized(clean, 'youtube_search', { query });
        await this.speak(`Searching YouTube for ${query}, sir.`);
        const ytUrl = buildYouTubeSearchUrl(query, false);
        await this.dispatchLaunchChrome(ytUrl);
        return;
      }
    }

    // 4. Google Search Commands (e.g. "search Google for Kashmir University exam dates", "search for...")
    const googleSearchMatch =
      clean.match(/^search\s+google\s+(for\s+)?(.+)/i) ||
      clean.match(/^google\s+(pe\s+search\s+karo|search)\s+(for\s+)?(.+)/i) ||
      clean.match(/^search\s+(for\s+)?(.+)/i);

    if (googleSearchMatch) {
      const query = (googleSearchMatch[2] || googleSearchMatch[3] || googleSearchMatch[1] || '').trim();
      // Make sure it doesn't just mean searching for an app
      if (query && !query.startsWith('notepad') && !query.startsWith('calculator')) {
        this.callbacks.onCommandRecognized(clean, 'google_search', { query });
        await this.speak(`Searching Google for ${query}, sir.`);
        const gUrl = buildGoogleSearchUrl(query);
        await this.dispatchLaunchChrome(gUrl);
        return;
      }
    }

    // 5. Tab & Navigation controls ("close tab", "new tab", "go back", "refresh")
    if (clean.includes('close tab') || clean.includes('close the current tab') || clean.includes('tab band karo')) {
      this.callbacks.onCommandRecognized(clean, 'close_tab');
      await this.speak('Closing the tab, sir.');
      await this.dispatchCloseTab();
      return;
    }

    if (clean.includes('new tab') || clean.includes('open a new tab') || clean.includes('naya tab')) {
      this.callbacks.onCommandRecognized(clean, 'new_tab');
      await this.speak('Opening a new tab in Chrome, sir.');
      await this.dispatchLaunchChrome('https://www.google.com');
      return;
    }

    if (clean.includes('refresh') || clean.includes('reload')) {
      this.callbacks.onCommandRecognized(clean, 'refresh');
      await this.speak('Refreshing page, sir.');
      return;
    }

    // 6. Open Windows Programs ("Open Notepad", "Open Calculator", "Open File Explorer", "Open Chrome")
    const appOpenMatch = clean.match(/^(open|launch|kholo|start|run)\s+(.+)/i);
    const targetName = appOpenMatch ? appOpenMatch[2].trim() : clean;

    const matchedApp = findMatchingApp(targetName, this.appsList);
    if (matchedApp) {
      this.callbacks.onCommandRecognized(clean, 'launch_windows_app', { app: matchedApp });
      await this.speak(`Opening ${matchedApp.name} for you, sir.`);
      await this.dispatchLaunchApp(matchedApp.executable || matchedApp.id);
      return;
    }

    // 7. Open Known Websites ("Open YouTube", "Open Google", "Open Instagram", "Open Facebook", "Open ChatGPT")
    const matchedWebsite = findMatchingWebsite(targetName);
    if (matchedWebsite) {
      this.callbacks.onCommandRecognized(clean, 'open_website', { website: matchedWebsite });
      await this.speak(`Opening ${matchedWebsite.name} for you, sir.`);
      await this.dispatchLaunchChrome(matchedWebsite.url);
      return;
    }

    // 8. General Website / URL (e.g. "Open kashmiruniversity.net" or any URL)
    if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(targetName) || targetName.startsWith('http')) {
      const url = targetName.startsWith('http') ? targetName : `https://${targetName}`;
      this.callbacks.onCommandRecognized(clean, 'open_url', { url });
      await this.speak(`Opening ${targetName} for you, sir.`);
      await this.dispatchLaunchChrome(url);
      return;
    }

    // 9. Fallback: Search on Google for the command
    this.callbacks.onCommandRecognized(clean, 'fallback_search', { query: clean });
    await this.speak(`Looking up ${clean} for you, sir.`);
    const fallbackUrl = buildGoogleSearchUrl(clean);
    await this.dispatchLaunchChrome(fallbackUrl);
  }

  /**
   * Dispatch Chrome launch to Desktop Companion Bridge or Server / Browser
   */
  public async dispatchLaunchChrome(url: string): Promise<boolean> {
    const bridgeUrl = this.config.desktopBridgeUrl || 'http://127.0.0.1:5005';

    // 1. Try local Python / Windows desktop companion bridge (port 5005)
    try {
      const res = await fetch(`${bridgeUrl}/launch-chrome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return true;
      }
    } catch (_) {
      // Local bridge not running, fallback to server system bridge
    }

    // 2. Try App Backend System Bridge (/api/system/launch-chrome)
    try {
      const serverRes = await fetch('/api/system/launch-chrome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (serverRes.ok) {
        const sData = await serverRes.json();
        if (sData.success) {
          // If on web or container, also trigger window.open
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
          } catch (_) {}
          return true;
        }
      }
    } catch (_) {}

    // 3. Browser native launch fallback
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    } catch (e) {
      console.warn('Fallback window.open blocked:', e);
      return false;
    }
  }

  /**
   * Dispatch Windows Application launch
   */
  public async dispatchLaunchApp(appId: string): Promise<boolean> {
    const bridgeUrl = this.config.desktopBridgeUrl || 'http://127.0.0.1:5005';

    // 1. Try local desktop companion bridge
    try {
      const res = await fetch(`${bridgeUrl}/launch-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return true;
      }
    } catch (_) {}

    // 2. Try app server system bridge
    try {
      const res = await fetch('/api/system/launch-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
    } catch (e) {
      console.warn('Server launch app failed:', e);
    }

    return false;
  }

  /**
   * Dispatch close current tab
   */
  public async dispatchCloseTab(): Promise<boolean> {
    const bridgeUrl = this.config.desktopBridgeUrl || 'http://127.0.0.1:5005';
    try {
      const res = await fetch(`${bridgeUrl}/close-tab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  }
}
