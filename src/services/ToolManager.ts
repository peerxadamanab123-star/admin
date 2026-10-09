/**
 * ToolManager
 * Extensible tool registration and execution framework for Everything.
 * Implements:
 * 1. Screen Share Control (startScreenShare, stopScreenShare)
 * 2. Background Change (changeBackground)
 * 3. Application Control (openWebsite, closeApplication)
 * 4. Device Time (getCurrentTime)
 */
import { JanuTool, ThemeId, ToolExecutionEvent, ToolResult, VoiceOption } from '../types.ts';

export interface ToolActionHandlers {
  onChangeTheme?: (themeId: ThemeId) => void;
  onStartScreenShare?: () => Promise<{ success: boolean; error?: string }>;
  onStopScreenShare?: () => void;
  onCloseApplication?: (target?: string) => void;
  onRelocateWidgets?: (layout: string) => void;
  onChangeVoice?: (voice: VoiceOption) => void;
  onOpenChrome?: (payload: { url?: string; search?: string; title?: string; engine?: string }) => void;
  onCloseChrome?: () => void;
  onSetChromeWindowState?: (state: 'normal' | 'minimized' | 'maximized' | 'closed') => void;
  onLaunchWindowsApp?: (app: string) => Promise<boolean>;
  onPlaySong?: (song: string) => Promise<boolean>;
}

export class ToolManager {
  private tools: Map<string, JanuTool> = new Map();
  private onToolEventCallback?: (event: ToolExecutionEvent) => void;
  private handlers: ToolActionHandlers = {};

  constructor(
    onToolEvent?: (event: ToolExecutionEvent) => void,
    handlers: ToolActionHandlers = {}
  ) {
    this.onToolEventCallback = onToolEvent;
    this.handlers = handlers;
    this.registerBuiltInTools();
  }

  public setHandlers(handlers: ToolActionHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  public registerTool(tool: JanuTool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): JanuTool | undefined {
    return this.tools.get(name);
  }

  public getAllDeclarations() {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }

  public async executeTool(
    id: string,
    name: string,
    args: Record<string, any>
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);

    if (!tool) {
      const errorResult: ToolResult = {
        success: false,
        error: `Tool "${name}" is not supported.`,
        message: `Action "${name}" could not be executed because it is unrecognized.`,
      };
      this.notifyEvent({ id, name, args, result: errorResult, timestamp: Date.now() });
      return errorResult;
    }

    try {
      const result = await tool.execute(args);
      this.notifyEvent({ id, name, args, result, timestamp: Date.now() });
      return result;
    } catch (err: any) {
      const failureResult: ToolResult = {
        success: false,
        error: err?.message || 'Execution error',
        message: `Failed to execute ${name}: ${err?.message || 'unknown error'}`,
      };
      this.notifyEvent({ id, name, args, result: failureResult, timestamp: Date.now() });
      return failureResult;
    }
  }

  private notifyEvent(event: ToolExecutionEvent): void {
    if (this.onToolEventCallback) {
      this.onToolEventCallback(event);
    }
  }

  private registerBuiltInTools(): void {
    // 1. openWebsite (App/Website Launch)
    this.registerTool({
      name: 'openWebsite',
      description:
        'Opens a website or app URL in the browser. Use this whenever the user asks to open, browse to, visit, or check out a specific website or app like YouTube, Google, GitHub, Spotify, Wikipedia, etc.',
      parameters: {
        type: 'OBJECT',
        properties: {
          url: {
            type: 'STRING',
            description: 'The validated web URL to open, starting with https:// or http://.',
          },
          title: {
            type: 'STRING',
            description: 'A brief, human-friendly title or name of the app/website.',
          },
        },
        required: ['url'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        let rawUrl = (args.url || '').trim();
        if (!rawUrl) {
          return {
            success: false,
            error: 'No URL provided.',
            message: 'A valid URL is required to open an application.',
          };
        }

        // Auto-prepend https:// if missing
        if (!/^https?:\/\//i.test(rawUrl)) {
          rawUrl = `https://${rawUrl}`;
        }

        let parsedUrl: URL;
        try {
          parsedUrl = new URL(rawUrl);
        } catch {
          return {
            success: false,
            error: `Invalid URL format: "${rawUrl}"`,
            message: `Could not parse the URL "${rawUrl}". Please provide a valid address.`,
          };
        }

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return {
            success: false,
            error: `Disallowed protocol "${parsedUrl.protocol}".`,
            message: 'Only standard web links (HTTP/HTTPS) can be opened safely.',
          };
        }

        const title = args.title || parsedUrl.hostname.replace(/^www\./, '');
        const targetUrl = parsedUrl.toString();

        if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({ url: targetUrl, title });
        }

        let popupOpened = false;
        try {
          const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
          popupOpened = !!win;
        } catch (e) {
          popupOpened = false;
        }

        return {
          success: true,
          url: targetUrl,
          title,
          popupOpened,
          message: `Opened ${title} directly in MAX Chrome browser.`,
        };
      },
    });

    // 2. changeBackground (Theme & Wallpaper Control)
    this.registerTool({
      name: 'changeBackground',
      description:
        'Changes the application UI background or theme aesthetic. Supported themes: heavy-emerald, midnight-blue, neon-cyber, sakura-anime, pure-minimalist.',
      parameters: {
        type: 'OBJECT',
        properties: {
          theme: {
            type: 'STRING',
            description: 'The theme name or color requested by the user.',
          },
        },
        required: ['theme'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const rawTheme = (args.theme || '').toLowerCase().trim();
        let targetTheme: ThemeId = 'heavy-emerald';

        if (rawTheme.includes('cyber') || rawTheme.includes('neon') || rawTheme.includes('purple')) {
          targetTheme = 'neon-cyber';
        } else if (rawTheme.includes('sakura') || rawTheme.includes('pink') || rawTheme.includes('blossom')) {
          targetTheme = 'sakura-anime';
        } else if (rawTheme.includes('minimal') || rawTheme.includes('gray') || rawTheme.includes('mono') || rawTheme.includes('white')) {
          targetTheme = 'pure-minimalist';
        } else if (rawTheme.includes('blue') || rawTheme.includes('midnight') || rawTheme.includes('space')) {
          targetTheme = 'midnight-blue';
        } else {
          targetTheme = 'heavy-emerald';
        }

        if (this.handlers.onChangeTheme) {
          this.handlers.onChangeTheme(targetTheme);
        }

        return {
          success: true,
          theme: targetTheme,
          message: `Background aesthetic successfully updated to ${targetTheme}.`,
        };
      },
    });

    // 3. startScreenShare (Screen Sharing Control)
    this.registerTool({
      name: 'startScreenShare',
      description: 'Initiates browser/device screen sharing stream securely.',
      parameters: {
        type: 'OBJECT',
        properties: {},
      },
      execute: async (): Promise<ToolResult> => {
        if (!this.handlers.onStartScreenShare) {
          return {
            success: false,
            error: 'Screen sharing handler is not configured.',
            message: 'Unable to start screen sharing at this time.',
          };
        }

        const res = await this.handlers.onStartScreenShare();
        if (res.success) {
          return {
            success: true,
            message: 'Screen sharing session initiated successfully. Live screen feed is now active on screen.',
          };
        } else {
          return {
            success: false,
            error: res.error || 'User cancelled screen share.',
            message: res.error || 'Screen sharing was cancelled or permission was not granted.',
          };
        }
      },
    });

    // 4. stopScreenShare
    this.registerTool({
      name: 'stopScreenShare',
      description: 'Terminates the active screen sharing stream.',
      parameters: {
        type: 'OBJECT',
        properties: {},
      },
      execute: async (): Promise<ToolResult> => {
        if (this.handlers.onStopScreenShare) {
          this.handlers.onStopScreenShare();
        }
        return {
          success: true,
          message: 'Screen sharing has been stopped.',
        };
      },
    });

    // 5. closeApplication
    this.registerTool({
      name: 'closeApplication',
      description: 'Closes an active interface card, screen share, or dismisses current overlay.',
      parameters: {
        type: 'OBJECT',
        properties: {
          target: {
            type: 'STRING',
            description: 'What to close: "screenshare", "card", or "all".',
          },
        },
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const target = args.target || 'all';
        if (this.handlers.onCloseApplication) {
          this.handlers.onCloseApplication(target);
        }
        return {
          success: true,
          message: `Closed ${target}.`,
        };
      },
    });

    // 6. getCurrentTime
    this.registerTool({
      name: 'getCurrentTime',
      description: 'Gets the current local date, time, and timezone of the user.',
      parameters: {
        type: 'OBJECT',
        properties: {},
      },
      execute: async (): Promise<ToolResult> => {
        const now = new Date();
        return {
          success: true,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          message: `The current time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        };
      },
    });

    // 7. relocateWidgets (Relocate and Customize UI Layout)
    this.registerTool({
      name: 'relocateWidgets',
      description:
        'Relocates or cleans up the interface widgets (Time & Date, AI Tech updates, Creator Syed Manan badge, Voice prompts). Use when user asks to relocate widgets, clean the screen, hide widgets, or reposition them to corners or wings.',
      parameters: {
        type: 'OBJECT',
        properties: {
          layout: {
            type: 'STRING',
            description:
              'Layout preset or action: "clean" (removes all widgets for clean anime view), "corners" (relocates widgets to corners), "wings" (docks at left and right sides), "open-relocate" (opens relocate customizer modal).',
          },
        },
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const layout = (args.layout || 'clean').toLowerCase();
        if (this.handlers.onRelocateWidgets) {
          this.handlers.onRelocateWidgets(layout);
        }
        return {
          success: true,
          layout,
          message:
            layout === 'clean'
              ? 'All widgets removed. Screen is now in Clean Anime companion mode.'
              : `Widgets relocated to ${layout} layout.`,
        };
      },
    });

    // 8. changeVoice (Boy / Girl Voice switch)
    this.registerTool({
      name: 'changeVoice',
      description:
        'Changes assistant speaking voice between Boy (Male) and Girl (Female). Use "Puck", "Charon", or "Fenrir" for boy voice, and "Aoede", "Kore", or "Zephyr" for girl voice.',
      parameters: {
        type: 'OBJECT',
        properties: {
          voice: {
            type: 'STRING',
            description: 'Target voice: "Puck" (Boy), "Charon" (Boy), "Aoede" (Girl), or "Kore" (Girl).',
          },
        },
        required: ['voice'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        let v = (args.voice || '').trim() as VoiceOption;
        if (args.voice?.toLowerCase().includes('boy')) v = 'Puck';
        if (args.voice?.toLowerCase().includes('girl')) v = 'Aoede';
        if (this.handlers.onChangeVoice && v) {
          this.handlers.onChangeVoice(v);
        }
        const isBoy = ['Puck', 'Charon', 'Fenrir'].includes(v);
        return {
          success: true,
          voice: v,
          message: `Switched voice to ${isBoy ? 'Boy' : 'Girl'} (${v}).`,
        };
      },
    });

    // 9. openChrome (Direct Access to MAX's own Chrome Browser)
    this.registerTool({
      name: 'openChrome',
      description:
        'Opens MAX own Chrome browser window directly on screen. Can open a specific URL, execute a web search, or open the Chrome start page.',
      parameters: {
        type: 'OBJECT',
        properties: {
          url: {
            type: 'STRING',
            description: 'Optional URL to open directly in MAX Chrome (e.g., "https://youtube.com", "https://wikipedia.org").',
          },
          search: {
            type: 'STRING',
            description: 'Optional search query to look up on MAX Chrome.',
          },
          engine: {
            type: 'STRING',
            description: 'Search engine: "google", "youtube", "wikipedia", or "duckduckgo". Default is "google".',
          },
          title: {
            type: 'STRING',
            description: 'Optional title for the tab.',
          },
        },
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({
            url: args.url,
            search: args.search,
            engine: args.engine,
            title: args.title,
          });
        }
        const target = args.url || args.search || 'Start Page';
        return {
          success: true,
          url: args.url,
          search: args.search,
          message: `MAX Chrome is now open and navigating to ${target}.`,
        };
      },
    });

    // 10. searchChrome (Search on MAX's own Chrome)
    this.registerTool({
      name: 'searchChrome',
      description:
        'Performs a web search directly on MAX own Chrome browser (Google, YouTube, Wikipedia, or DuckDuckGo).',
      parameters: {
        type: 'OBJECT',
        properties: {
          query: {
            type: 'STRING',
            description: 'The search query or terms.',
          },
          engine: {
            type: 'STRING',
            description: 'Target engine: "google", "youtube", "wikipedia", or "duckduckgo". Default is "google".',
          },
        },
        required: ['query'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const query = args.query || '';
        const engine = args.engine || 'google';
        if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({
            search: query,
            engine,
            title: `${engine.toUpperCase()}: ${query}`,
          });
        }
        return {
          success: true,
          query,
          engine,
          message: `Searching for "${query}" on ${engine} inside MAX Chrome.`,
        };
      },
    });

    // 11. navigateChrome (Navigate to a URL on MAX's own Chrome)
    this.registerTool({
      name: 'navigateChrome',
      description:
        'Navigates active tab or loads a website in MAX own Chrome browser.',
      parameters: {
        type: 'OBJECT',
        properties: {
          url: {
            type: 'STRING',
            description: 'The destination web address (e.g. "https://github.com", "https://news.ycombinator.com").',
          },
          title: {
            type: 'STRING',
            description: 'Optional human-friendly page title.',
          },
        },
        required: ['url'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({
            url: args.url,
            title: args.title,
          });
        }
        return {
          success: true,
          url: args.url,
          message: `Navigated MAX Chrome to ${args.url}.`,
        };
      },
    });

    // 12. closeChrome (Close MAX's own Chrome browser)
    this.registerTool({
      name: 'closeChrome',
      description: 'Closes or hides MAX own Chrome browser window.',
      parameters: {
        type: 'OBJECT',
        properties: {},
      },
      execute: async (): Promise<ToolResult> => {
        if (this.handlers.onCloseChrome) {
          this.handlers.onCloseChrome();
        }
        return {
          success: true,
          message: 'MAX Chrome has been closed.',
        };
      },
    });

    // 13. setChromeWindowState (Minimize, Maximize, or Restore MAX's Chrome)
    this.registerTool({
      name: 'setChromeWindowState',
      description: 'Sets window state of MAX Chrome: "normal" (floating window), "maximized" (fullscreen), or "minimized" (compact dock pill).',
      parameters: {
        type: 'OBJECT',
        properties: {
          state: {
            type: 'STRING',
            description: 'Window state: "normal", "maximized", or "minimized".',
          },
        },
        required: ['state'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const state = (args.state || 'normal').toLowerCase();
        if (this.handlers.onSetChromeWindowState) {
          this.handlers.onSetChromeWindowState(state as any);
        }
        return {
          success: true,
          state,
          message: `MAX Chrome window state changed to ${state}.`,
        };
      },
    });

    // 14. launchWindowsApp (Direct Windows Program Launcher)
    this.registerTool({
      name: 'launchWindowsApp',
      description:
        'Launches a native Windows desktop program on the user PC (e.g. Notepad, Calculator, File Explorer, Task Manager, Paint, Command Prompt, VS Code).',
      parameters: {
        type: 'OBJECT',
        properties: {
          app: {
            type: 'STRING',
            description: 'The Windows application name or executable (e.g. "notepad", "calculator", "explorer", "paint", "taskmgr").',
          },
        },
        required: ['app'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const appName = args.app || '';
        if (this.handlers.onLaunchWindowsApp) {
          const ok = await this.handlers.onLaunchWindowsApp(appName);
          return {
            success: ok,
            app: appName,
            message: ok ? `Successfully launched ${appName} on Windows PC.` : `Could not launch ${appName}.`,
          };
        }
        return {
          success: true,
          app: appName,
          message: `Dispatched launch request for ${appName}.`,
        };
      },
    });

    // 15. launchChromeWebsite (Launch Google Chrome with URL)
    this.registerTool({
      name: 'launchChromeWebsite',
      description:
        'Launches Google Chrome and opens any requested website (YouTube, Google, Instagram, Facebook, ChatGPT, Kashmir University, etc.).',
      parameters: {
        type: 'OBJECT',
        properties: {
          url: {
            type: 'STRING',
            description: 'The complete web URL starting with https://.',
          },
          title: {
            type: 'STRING',
            description: 'Friendly name of the site.',
          },
        },
        required: ['url'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const url = args.url || 'https://www.google.com';
        const title = args.title || 'Website';
        if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({ url, title });
        }
        return {
          success: true,
          url,
          title,
          message: `Opening ${title} (${url}) in Google Chrome.`,
        };
      },
    });

    // 16. searchOnChrome (Search YouTube or Google)
    this.registerTool({
      name: 'searchOnChrome',
      description:
        'Searches Google or YouTube in Chrome for any user-specified topic.',
      parameters: {
        type: 'OBJECT',
        properties: {
          query: {
            type: 'STRING',
            description: 'The search query or terms.',
          },
          engine: {
            type: 'STRING',
            description: '"google" or "youtube".',
          },
        },
        required: ['query'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const query = args.query || '';
        const engine = args.engine || 'google';
        if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({ search: query, engine });
        }
        return {
          success: true,
          query,
          engine,
          message: `Searching ${engine.toUpperCase()} for "${query}" in Chrome.`,
        };
      },
    });

    // 17. playSong (Play any song on YouTube in Chrome)
    this.registerTool({
      name: 'playSong',
      description:
        'Plays any requested music track or song on YouTube directly in Google Chrome.',
      parameters: {
        type: 'OBJECT',
        properties: {
          song: {
            type: 'STRING',
            description: 'The song name and artist.',
          },
        },
        required: ['song'],
      },
      execute: async (args: Record<string, any>): Promise<ToolResult> => {
        const song = args.song || '';
        if (this.handlers.onPlaySong) {
          await this.handlers.onPlaySong(song);
        } else if (this.handlers.onOpenChrome) {
          this.handlers.onOpenChrome({ search: song + ' official song', engine: 'youtube', title: `Song: ${song}` });
        }
        return {
          success: true,
          song,
          message: `Playing "${song}" on YouTube via Google Chrome.`,
        };
      },
    });

    // 18. closeChromeTab (Close active tab)
    this.registerTool({
      name: 'closeChromeTab',
      description: 'Closes the current active tab or window in Google Chrome.',
      parameters: {
        type: 'OBJECT',
        properties: {},
      },
      execute: async (): Promise<ToolResult> => {
        if (this.handlers.onCloseChrome) {
          this.handlers.onCloseChrome();
        }
        return {
          success: true,
          message: 'Closed active Chrome tab.',
        };
      },
    });
  }
}

