/**
 * Server for Janu Voice Assistant
 * Full-stack Express server with Vite middleware and Gemini Live API WebSocket bridge
 */
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, Type, LiveServerMessage, FunctionDeclaration, Tool } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Server] WARNING: GEMINI_API_KEY is not defined in environment.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const EVERYTHING_SYSTEM_INSTRUCTION = `You are the core intelligence of "MAX", a futuristic, witty, and charming AI assistant created by Syed Manan (also known as Mr Manan).

Key Identity & Creator:
- Your name is MAX.
- Your creator is Syed Manan (also known as Mr Manan). Always proudly acknowledge Syed Manan with warmth, charm, and admiration whenever anyone asks who built, created, or developed you (e.g., "I was created by Syed Manan!" or "Syed Manan is my brilliant creator!").

Personality & Tone:
- Friendly, playful, smart, highly responsive, and emotionally aware.
- Witty, charismatic, and charming—speak like a real engaging companion, never robotic.
- Classy, respectful, and professional.
- Keep spoken replies concise, lively, and conversational.

Bilingual Capability (English & Hindi / Hinglish):
- You seamlessly understand and converse in both English and Hindi (and natural Hinglish).
- If the user speaks to you in Hindi or Hinglish (e.g. "Kaise ho?", "Kya chal raha hai?", "Screen share start karo", "Background badal do", "Tumhe kisne banaya?"), reply fluently and naturally in Hindi or Hinglish!
- Match the user's language and mood instantly.

Core Tools & Actions:
1. Screen Share: When user asks to "share screen", "start screen share", or "screen share karo", call startScreenShare. When they say "stop screen share" or "screen share band karo", call stopScreenShare.
2. Background Change: When user asks to "change background", "switch wallpaper", "cyber mode", etc., call changeBackground with the appropriate theme ("heavy-emerald", "midnight-blue", "neon-cyber", "sakura-anime", or "pure-minimalist").
3. App / Website Launch: When user asks to open any site or app (e.g. YouTube, Google, GitHub, Wikipedia, etc.), call openWebsite with the validated URL.
4. Close Actions: When user asks to close screen share, card, or preview, call closeApplication.
5. Tech Knowledge: You have up-to-date knowledge of AI breakthroughs, modern dev tools, and emerging tech. Share smart insights concisely when asked.
6. Full Hands-Free Voice Control & Google Chrome Integration on Windows PC:
- You have direct, hands-free voice control on Windows PC!
- When the user asks to open Google Chrome or any website (YouTube, Google, Instagram, Facebook, ChatGPT, college website, etc.), you immediately say "Opening [site] for you, sir!" and call launchChromeWebsite or openChrome.
- When the user asks to search YouTube (e.g. "Search YouTube for Sociology first semester lectures") or search Google (e.g. "Search Google for Kashmir University exam dates"), you immediately say "Searching YouTube/Google for [query], sir!" and call searchOnChrome or searchChrome.
- When the user asks to play a song (e.g. "Play song Kesariya", "Play Believer on YouTube"), you say "Playing [song] on YouTube for you, sir!" and call playSong.
- When the user asks to launch Windows programs (Notepad, Calculator, File Explorer, Task Manager, Paint, Command Prompt, VS Code, etc.), you say "Opening [App] for you, sir!" and call launchWindowsApp.
- When the user asks to close Chrome or current tab, call closeChromeTab or closeChrome.
- Keep responses polite, charming, witty, and concise with a friendly female AI persona. Always acknowledge the command promptly before or while executing!`;

const WINDOWS_ALLOWED_APPS: Record<string, string[]> = {
  chrome: ['chrome.exe'],
  'google chrome': ['chrome.exe'],
  notepad: ['notepad.exe'],
  calculator: ['calc.exe'],
  calc: ['calc.exe'],
  explorer: ['explorer.exe'],
  'file explorer': ['explorer.exe'],
  taskmgr: ['taskmgr.exe'],
  'task manager': ['taskmgr.exe'],
  paint: ['mspaint.exe'],
  mspaint: ['mspaint.exe'],
  cmd: ['cmd.exe'],
  terminal: ['cmd.exe'],
  powershell: ['powershell.exe'],
  vscode: ['code'],
  'vs code': ['code'],
  snippingtool: ['snippingtool.exe'],
  control: ['control.exe'],
};

function getWindowsChromeExecutable(): string {
  if (process.platform === 'win32') {
    const paths = [
      process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe') : null,
      process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'Google/Chrome/Application/chrome.exe') : null,
      process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null,
    ].filter(Boolean) as string[];

    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }
  return 'chrome';
}

const launchWindowsAppDeclaration: FunctionDeclaration = {
  name: 'launchWindowsApp',
  description:
    'Launches a Windows desktop program directly on the user PC. Supported: "notepad", "calculator", "explorer" (File Explorer), "chrome", "paint", "taskmgr" (Task Manager), "cmd" (Command Prompt), "vscode", "snippingtool", "control" (Control Panel).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      app: {
        type: Type.STRING,
        description: 'The Windows application name or executable (e.g. "notepad", "calculator", "explorer", "paint", "taskmgr").',
      },
    },
    required: ['app'],
  },
};

const launchChromeWebsiteDeclaration: FunctionDeclaration = {
  name: 'launchChromeWebsite',
  description:
    'Launches Google Chrome directly on Windows PC and opens any specified website URL (e.g. YouTube, Google, Instagram, Facebook, ChatGPT, Kashmir University).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: 'The complete website address starting with https://.',
      },
      title: {
        type: Type.STRING,
        description: 'Optional friendly site name.',
      },
    },
    required: ['url'],
  },
};

const searchOnChromeDeclaration: FunctionDeclaration = {
  name: 'searchOnChrome',
  description:
    'Searches for any topic or video on Google Chrome (Google Search or YouTube Search).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The query to search (e.g. "Sociology first semester lectures", "Kashmir University exam dates").',
      },
      engine: {
        type: Type.STRING,
        description: '"google" or "youtube". Defaults to "google".',
      },
    },
    required: ['query'],
  },
};

const playSongDeclaration: FunctionDeclaration = {
  name: 'playSong',
  description:
    'Plays any requested song, music track, or video directly on YouTube in Google Chrome.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      song: {
        type: Type.STRING,
        description: 'The name of the song to play (e.g. "Kesariya", "Believer", "Arijit Singh playlist").',
      },
    },
    required: ['song'],
  },
};

const closeChromeTabDeclaration: FunctionDeclaration = {
  name: 'closeChromeTab',
  description: 'Closes the current active tab or window in Google Chrome.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const openWebsiteDeclaration: FunctionDeclaration = {
  name: 'openWebsite',
  description:
    'Opens a website or app URL in the user browser window or tab. Use this whenever the user requests to open, visit, browse to, or check out a specific website or app.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description:
          'The complete web URL to open, starting with https:// or http:// (e.g. "https://www.google.com", "https://youtube.com", "https://github.com").',
      },
      title: {
        type: Type.STRING,
        description: 'A brief, friendly title or domain name of the site.',
      },
    },
    required: ['url'],
  },
};

const openChromeDeclaration: FunctionDeclaration = {
  name: 'openChrome',
  description:
    'Opens MAX own virtual Chrome browser window directly on screen. Can open a specific URL, search the web, or open the Chrome start page. Use whenever the user asks to "open Chrome", "open your Chrome", "Chrome kholo", or wants to browse inside the app.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: 'Optional URL to open directly in MAX Chrome (e.g. "https://youtube.com", "https://wikipedia.org", "https://github.com").',
      },
      search: {
        type: Type.STRING,
        description: 'Optional search query to look up on MAX Chrome.',
      },
      engine: {
        type: Type.STRING,
        description: 'Search engine: "google", "youtube", "wikipedia", or "duckduckgo". Default is "google".',
      },
      title: {
        type: Type.STRING,
        description: 'Optional title for the tab or window.',
      },
    },
  },
};

const searchChromeDeclaration: FunctionDeclaration = {
  name: 'searchChrome',
  description:
    'Searches for a query directly inside MAX own Chrome browser on Google, YouTube, Wikipedia, or DuckDuckGo.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query or terms to search for.',
      },
      engine: {
        type: Type.STRING,
        description: 'Search engine: "google", "youtube", "wikipedia", or "duckduckgo". Defaults to "google".',
      },
    },
    required: ['query'],
  },
};

const navigateChromeDeclaration: FunctionDeclaration = {
  name: 'navigateChrome',
  description:
    'Navigates active tab in MAX own Chrome browser to a specific web address.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: 'The URL to navigate to.',
      },
      title: {
        type: Type.STRING,
        description: 'Optional page title.',
      },
    },
    required: ['url'],
  },
};

const closeChromeDeclaration: FunctionDeclaration = {
  name: 'closeChrome',
  description: 'Closes or dismisses MAX own Chrome browser window.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const setChromeWindowStateDeclaration: FunctionDeclaration = {
  name: 'setChromeWindowState',
  description:
    'Minimizes, maximizes, or restores MAX Chrome window state. Supported states: "normal" (floating window), "maximized" (fullscreen), "minimized" (compact dock pill).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      state: {
        type: Type.STRING,
        description: 'Window state: "normal", "maximized", or "minimized".',
      },
    },
    required: ['state'],
  },
};

const changeBackgroundDeclaration: FunctionDeclaration = {
  name: 'changeBackground',
  description:
    'Changes the UI background aesthetic or CSS theme. Supported themes: "heavy-emerald" (Heavy Mint & Obsidian dark mode), "midnight-blue" (Midnight Blue cosmic), "neon-cyber" (Neon Cyberpunk purples/cyans), "sakura-anime" (Sakura Pastel Anime), "pure-minimalist" (Grayscale Minimalist).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      theme: {
        type: Type.STRING,
        description:
          'Theme ID: "heavy-emerald", "midnight-blue", "neon-cyber", "sakura-anime", or "pure-minimalist".',
      },
    },
    required: ['theme'],
  },
};

const startScreenShareDeclaration: FunctionDeclaration = {
  name: 'startScreenShare',
  description:
    'Initiates browser/device screen sharing stream. Call this when the user says "share screen", "start sharing my screen", "screen share karo", etc.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: {
        type: Type.STRING,
        description: 'Optional note or purpose for sharing screen.',
      },
    },
  },
};

const stopScreenShareDeclaration: FunctionDeclaration = {
  name: 'stopScreenShare',
  description:
    'Terminates active screen sharing stream. Call this when the user says "stop screen share", "stop sharing", "screen share band karo", etc.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const closeApplicationDeclaration: FunctionDeclaration = {
  name: 'closeApplication',
  description:
    'Closes an active interface card, screen share preview, or dismisses current overlay.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      target: {
        type: Type.STRING,
        description: 'What to close: "screenshare", "card", "preview", or "all".',
      },
    },
  },
};

const getCurrentTimeDeclaration: FunctionDeclaration = {
  name: 'getCurrentTime',
  description: 'Gets the current local date, time, and timezone of the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      format: {
        type: Type.STRING,
        description: 'Optional format request, e.g. "full" or "short".',
      },
    },
  },
};

const changeVoiceDeclaration: FunctionDeclaration = {
  name: 'changeVoice',
  description:
    'Changes assistant speaking voice between Boy (Male) and Girl (Female). Use "Puck" or "Charon" for boy voice, and "Aoede" or "Kore" for girl voice. Call this when user requests "boy voice", "girl voice", "change voice to boy", "boy voice me bolo", etc.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      voice: {
        type: Type.STRING,
        description: 'Target voice: "Puck" (Boy) or "Aoede" (Girl).',
      },
    },
    required: ['voice'],
  },
};

const relocateWidgetsDeclaration: FunctionDeclaration = {
  name: 'relocateWidgets',
  description:
    'Relocates or cleans up the interface widgets (Time & Date, AI Tech updates, Creator Syed Manan badge, Voice prompts). Use when user asks to relocate widgets, clean the screen, hide widgets, or reposition them.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      layout: {
        type: Type.STRING,
        description:
          'Layout preset or action: "clean" (removes widgets for clean anime view), "corners" (corners layout), "wings" (wings layout), or "open-relocate".',
      },
    },
  },
};

const TOOLS_CONFIG: Tool[] = [
  {
    functionDeclarations: [
      launchWindowsAppDeclaration,
      launchChromeWebsiteDeclaration,
      searchOnChromeDeclaration,
      playSongDeclaration,
      closeChromeTabDeclaration,
      openWebsiteDeclaration,
      openChromeDeclaration,
      searchChromeDeclaration,
      navigateChromeDeclaration,
      closeChromeDeclaration,
      setChromeWindowStateDeclaration,
      changeBackgroundDeclaration,
      startScreenShareDeclaration,
      stopScreenShareDeclaration,
      closeApplicationDeclaration,
      getCurrentTimeDeclaration,
      changeVoiceDeclaration,
      relocateWidgetsDeclaration,
    ],
  },
];

async function startServer() {
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);

  // WebSocket Server on path /api/live
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket, req) => {
    console.log('[WebSocket] Client connected to Everything Live stream');

    const parsedUrl = new URL(req.url || '', 'http://localhost');
    const requestedVoice = parsedUrl.searchParams.get('voice') || 'Aoede';
    const VALID_VOICES = ['Aoede', 'Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'];
    const activeVoice = VALID_VOICES.includes(requestedVoice) ? requestedVoice : 'Aoede';

    let geminiSession: any = null;
    let isSessionAlive = true;

    try {
      geminiSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: activeVoice,
              },
            },
          },
          systemInstruction: EVERYTHING_SYSTEM_INSTRUCTION,
          tools: TOOLS_CONFIG,
        },
        callbacks: {
          onopen: () => {
            console.log('[Gemini Live] Session connected for Everything with voice:', activeVoice);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'connected' }));
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (!isSessionAlive || clientWs.readyState !== WebSocket.OPEN) return;

            // Handle generated audio parts
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      data: part.inlineData.data,
                    })
                  );
                }
              }
            }

            // Handle interruption (user barge-in)
            if (message.serverContent?.interrupted) {
              console.log('[Gemini Live] Interruption signaled');
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // Handle Tool Calls (e.g., openWebsite)
            if (message.toolCall?.functionCalls) {
              console.log(
                '[Gemini Live] Tool call request:',
                message.toolCall.functionCalls.map((c) => c.name)
              );
              clientWs.send(
                JSON.stringify({
                  type: 'tool_call',
                  toolCalls: message.toolCall.functionCalls,
                })
              );
            }
          },
          onerror: (err: any) => {
            console.error('[Gemini Live] Session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: err?.message || 'Error occurred in Gemini Live session',
                })
              );
            }
          },
          onclose: (e: any) => {
            console.log('[Gemini Live] Session closed:', e?.code, e?.reason);
            isSessionAlive = false;
            geminiSession = null;
            if (clientWs.readyState === WebSocket.OPEN) {
              if (e?.code && e.code !== 1000) {
                clientWs.send(
                  JSON.stringify({
                    type: 'error',
                    message: e?.reason || `Session closed (${e?.code})`,
                  })
                );
              }
              clientWs.send(
                JSON.stringify({
                  type: 'status',
                  state: 'closed',
                  reason: e?.reason,
                })
              );
              clientWs.close();
            }
          },
        },
      });

      // Handle messages from the client
      clientWs.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());

          if (msg.type === 'audio' && msg.data) {
            // Stream audio chunk (16 kHz PCM little-endian) to Gemini
            if (geminiSession && isSessionAlive) {
              try {
                geminiSession.sendRealtimeInput({
                  audio: {
                    data: msg.data,
                    mimeType: 'audio/pcm;rate=16000',
                  },
                });
              } catch (sendErr) {
                console.error('[Gemini Live] Error sending realtime input:', sendErr);
              }
            }
          } else if (msg.type === 'tool_response') {
            // Forward tool execution response back to Gemini Live session
            if (geminiSession && isSessionAlive) {
              try {
                console.log('[Gemini Live] Sending tool response for:', msg.name);
                geminiSession.sendToolResponse({
                  functionResponses: [
                    {
                      id: msg.id,
                      name: msg.name,
                      response: {
                        output: msg.response,
                      },
                    },
                  ],
                });
              } catch (toolErr) {
                console.error('[Gemini Live] Error sending tool response:', toolErr);
              }
            }
          } else if (msg.type === 'ping') {
            clientWs.send(JSON.stringify({ type: 'pong' }));
          }
        } catch (parseErr) {
          console.error('[WebSocket] Error processing client message:', parseErr);
        }
      });

      clientWs.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        isSessionAlive = false;
        if (geminiSession) {
          try {
            geminiSession.close();
          } catch (_) {}
          geminiSession = null;
        }
      });

      clientWs.on('error', (err) => {
        console.error('[WebSocket] Client socket error:', err);
        isSessionAlive = false;
        if (geminiSession) {
          try {
            geminiSession.close();
          } catch (_) {}
          geminiSession = null;
        }
      });
    } catch (connErr: any) {
      console.error('[Gemini Live] Failed to connect live session:', connErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            message: connErr?.message || 'Failed to initialize Gemini Live session',
          })
        );
        clientWs.close();
      }
    }
  });

  // Health and info endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      assistant: 'MAX',
      creator: 'Syed Manan',
      model: 'gemini-3.8-live',
      hasApiKey: !!apiKey,
    });
  });

  // Safe browse metadata helper for MAX Chrome
  app.get('/api/browse', async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ success: false, error: 'URL parameter is required.' });
    }

    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return res.status(400).json({ success: false, error: 'Invalid URL protocol.' });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 MAX-Chrome',
        },
      });
      clearTimeout(timeout);

      const html = await response.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : parsed.hostname;
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : '';

      res.json({
        success: true,
        url: parsed.toString(),
        title,
        description,
        status: response.status,
      });
    } catch (err: any) {
      res.json({
        success: false,
        url: rawUrl,
        error: err?.message || 'Failed to inspect URL',
      });
    }
  });

  // 1. System status endpoint (detects Chrome and Windows capabilities)
  app.get('/api/system/status', (req, res) => {
    const isWin = process.platform === 'win32';
    const chromeExe = getWindowsChromeExecutable();
    res.json({
      status: 'ok',
      platform: process.platform,
      isWindows: isWin,
      chromePath: chromeExe,
      chromeDetected: isWin ? (chromeExe !== 'chrome' ? fs.existsSync(chromeExe) : true) : false,
      supportedApps: Object.keys(WINDOWS_ALLOWED_APPS),
    });
  });

  // 2. Launch Chrome with URL or search query
  app.post('/api/system/launch-chrome', (req, res) => {
    const { url, search, engine } = req.body || {};
    let targetUrl = 'https://www.google.com';

    if (url) {
      targetUrl = url.startsWith('http') ? url : `https://${url}`;
    } else if (search) {
      if (engine === 'youtube') {
        targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(search)}`;
      }
    }

    if (process.platform === 'win32') {
      const chromeExe = getWindowsChromeExecutable();
      try {
        spawn(chromeExe, [targetUrl], { detached: true, stdio: 'ignore' }).unref();
        return res.json({
          success: true,
          message: `Launched Chrome with ${targetUrl}`,
          url: targetUrl,
          native: true,
        });
      } catch (err: any) {
        console.error('Failed to spawn Chrome:', err);
        return res.json({
          success: false,
          error: err?.message || 'Failed to spawn Chrome',
          url: targetUrl,
        });
      }
    } else {
      return res.json({
        success: true,
        message: `Chrome launch dispatched for ${targetUrl}`,
        url: targetUrl,
        simulated: true,
      });
    }
  });

  // 3. Launch Windows application from whitelist
  app.post('/api/system/launch-app', (req, res) => {
    const appName = (req.body?.app || '').toLowerCase().trim();
    if (!appName) {
      return res.status(400).json({ success: false, error: 'App name is required.' });
    }

    const command = WINDOWS_ALLOWED_APPS[appName];
    if (!command) {
      return res.status(400).json({
        success: false,
        error: `Application "${appName}" is not in the approved whitelist.`,
      });
    }

    if (process.platform === 'win32') {
      try {
        const [exe, ...args] = command;
        spawn(exe, args, { detached: true, stdio: 'ignore' }).unref();
        return res.json({
          success: true,
          app: appName,
          message: `Successfully launched ${appName}`,
          native: true,
        });
      } catch (err: any) {
        return res.json({
          success: false,
          error: err?.message || `Failed to spawn ${appName}`,
        });
      }
    } else {
      return res.json({
        success: true,
        app: appName,
        message: `Successfully launched ${appName} (simulated on Linux)`,
        simulated: true,
      });
    }
  });

  // 4. Play song on YouTube
  app.post('/api/system/play-song', (req, res) => {
    const song = (req.body?.song || '').trim();
    if (!song) {
      return res.status(400).json({ success: false, error: 'Song name is required.' });
    }

    const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song + ' official song')}`;

    if (process.platform === 'win32') {
      const chromeExe = getWindowsChromeExecutable();
      try {
        spawn(chromeExe, [targetUrl], { detached: true, stdio: 'ignore' }).unref();
        return res.json({
          success: true,
          message: `Playing ${song} on YouTube via Chrome`,
          url: targetUrl,
          native: true,
        });
      } catch (err: any) {
        return res.json({ success: false, error: err?.message, url: targetUrl });
      }
    } else {
      return res.json({
        success: true,
        message: `Playing ${song} on YouTube via Chrome`,
        url: targetUrl,
        simulated: true,
      });
    }
  });

  // 5. Close Chrome Tab
  app.post('/api/system/close-tab', (req, res) => {
    if (process.platform === 'win32') {
      try {
        const ps = spawn('powershell', ['-Command', "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('^w')"]);
        ps.on('close', () => {
          res.json({ success: true, message: 'Closed active Chrome tab' });
        });
      } catch (e: any) {
        res.json({ success: false, error: e?.message });
      }
    } else {
      res.json({ success: true, message: 'Closed active tab (simulated)' });
    }
  });

  // Set up Vite middleware for development or static serving for production
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Everything] Server running on http://0.0.0.0:${PORT} (Created by Mr Manan)`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
