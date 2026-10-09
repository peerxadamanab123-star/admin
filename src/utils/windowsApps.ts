import { WindowsAppInfo, CustomVoiceShortcut } from '../types.ts';

export const DEFAULT_WINDOWS_APPS: WindowsAppInfo[] = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    executable: 'chrome.exe',
    aliases: ['chrome', 'google chrome', 'browser', 'web browser'],
    description: 'Fast, secure Google Chrome web browser',
    category: 'browsing',
    icon: '🌐',
  },
  {
    id: 'notepad',
    name: 'Notepad',
    executable: 'notepad.exe',
    aliases: ['notepad', 'note pad', 'text editor', 'notes'],
    description: 'Windows simple text editor',
    category: 'productivity',
    icon: '📝',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    executable: 'calc.exe',
    aliases: ['calculator', 'calc', 'hisab', 'hisaab', 'math'],
    description: 'Windows Calculator for arithmetic and scientific math',
    category: 'utility',
    icon: '🧮',
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    executable: 'explorer.exe',
    aliases: ['file explorer', 'explorer', 'my computer', 'this pc', 'files', 'folders'],
    description: 'Windows file manager and drive browser',
    category: 'system',
    icon: '📁',
  },
  {
    id: 'taskmgr',
    name: 'Task Manager',
    executable: 'taskmgr.exe',
    aliases: ['task manager', 'taskmgr', 'processes', 'performance'],
    description: 'Windows Task Manager monitoring CPU and memory',
    category: 'system',
    icon: '📊',
  },
  {
    id: 'paint',
    name: 'Paint',
    executable: 'mspaint.exe',
    aliases: ['paint', 'mspaint', 'ms paint', 'drawing'],
    description: 'Classic Windows MS Paint application',
    category: 'media',
    icon: '🎨',
  },
  {
    id: 'cmd',
    name: 'Command Prompt',
    executable: 'cmd.exe',
    aliases: ['command prompt', 'cmd', 'terminal', 'dos prompt'],
    description: 'Windows standard command prompt terminal',
    category: 'utility',
    icon: '💻',
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    executable: 'powershell.exe',
    aliases: ['powershell', 'power shell', 'windows powershell'],
    description: 'Windows PowerShell modern shell',
    category: 'utility',
    icon: '⚡',
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    executable: 'code',
    aliases: ['vs code', 'vscode', 'visual studio code', 'code editor'],
    description: 'Modern code and script development environment',
    category: 'productivity',
    icon: '🧑‍💻',
  },
  {
    id: 'snippingtool',
    name: 'Snipping Tool',
    executable: 'snippingtool.exe',
    aliases: ['snipping tool', 'snip', 'screenshot', 'screen capture'],
    description: 'Windows screen capture and snip utility',
    category: 'utility',
    icon: '✂️',
  },
  {
    id: 'control',
    name: 'Control Panel',
    executable: 'control.exe',
    aliases: ['control panel', 'control'],
    description: 'Classic Windows control panel system settings',
    category: 'system',
    icon: '⚙️',
  },
];

export const POPULAR_WEBSITES: Record<string, { name: string; url: string; aliases: string[] }> = {
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    aliases: ['youtube', 'you tube', 'yt', 'videos'],
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com',
    aliases: ['google', 'google search', 'google com'],
  },
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com',
    aliases: ['instagram', 'insta', 'ig'],
  },
  facebook: {
    name: 'Facebook',
    url: 'https://www.facebook.com',
    aliases: ['facebook', 'fb'],
  },
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    aliases: ['chatgpt', 'chat gpt', 'openai chat', 'gpt'],
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com',
    aliases: ['github', 'git hub'],
  },
  whatsapp: {
    name: 'WhatsApp Web',
    url: 'https://web.whatsapp.com',
    aliases: ['whatsapp', 'whats app', 'whatsapp web'],
  },
  reddit: {
    name: 'Reddit',
    url: 'https://www.reddit.com',
    aliases: ['reddit'],
  },
  twitter: {
    name: 'Twitter (X)',
    url: 'https://x.com',
    aliases: ['twitter', 'x', 'x com'],
  },
  wikipedia: {
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org',
    aliases: ['wikipedia', 'wiki'],
  },
  kashmiruniversity: {
    name: 'Kashmir University',
    url: 'https://kashmiruniversity.net',
    aliases: ['kashmir university', 'ku', 'kashmir uni', 'college website', 'my college'],
  },
  spotify: {
    name: 'Spotify',
    url: 'https://open.spotify.com',
    aliases: ['spotify', 'spotify web', 'spotify music'],
  },
  netflix: {
    name: 'Netflix',
    url: 'https://www.netflix.com',
    aliases: ['netflix'],
  },
  gmail: {
    name: 'Gmail',
    url: 'https://mail.google.com',
    aliases: ['gmail', 'google mail', 'email', 'my email'],
  },
};

export const DEFAULT_CUSTOM_SHORTCUTS: CustomVoiceShortcut[] = [
  {
    id: 'sc-1',
    trigger: 'college website',
    target: 'https://kashmiruniversity.net',
    type: 'website',
    description: 'Kashmir University official portal',
  },
  {
    id: 'sc-2',
    trigger: 'my college',
    target: 'https://kashmiruniversity.net',
    type: 'website',
    description: 'Kashmir University portal',
  },
  {
    id: 'sc-3',
    trigger: 'exam dates',
    target: 'https://www.google.com/search?q=Kashmir+University+exam+dates',
    type: 'website',
    description: 'Google search Kashmir University exam dates',
  },
  {
    id: 'sc-4',
    trigger: 'ai news',
    target: 'https://news.ycombinator.com',
    type: 'website',
    description: 'Hacker News latest tech and AI news',
  },
];

/**
 * Match spoken text to a supported Windows app
 */
export function findMatchingApp(spokenText: string, appsList: WindowsAppInfo[] = DEFAULT_WINDOWS_APPS): WindowsAppInfo | null {
  const normalized = spokenText.toLowerCase().trim();

  for (const app of appsList) {
    if (app.name.toLowerCase() === normalized || app.executable.toLowerCase() === normalized) {
      return app;
    }
    for (const alias of app.aliases) {
      if (normalized === alias || normalized.includes(alias)) {
        return app;
      }
    }
  }

  return null;
}

/**
 * Match spoken text to a known website
 */
export function findMatchingWebsite(spokenText: string): { name: string; url: string } | null {
  const normalized = spokenText.toLowerCase().trim();

  for (const key of Object.keys(POPULAR_WEBSITES)) {
    const site = POPULAR_WEBSITES[key];
    if (site.name.toLowerCase() === normalized) {
      return site;
    }
    for (const alias of site.aliases) {
      if (normalized === alias || normalized.includes(alias)) {
        return site;
      }
    }
  }

  // Check if it's a domain name (e.g. "reddit.com", "bbc.co.uk")
  const domainMatch = normalized.match(/([a-z0-9-]+\.[a-z]{2,})/i);
  if (domainMatch) {
    const domain = domainMatch[1];
    return {
      name: domain,
      url: domain.startsWith('http') ? domain : `https://${domain}`,
    };
  }

  return null;
}

/**
 * Build URL to search YouTube or play a song
 */
export function buildYouTubeSearchUrl(query: string, isSong = false): string {
  const clean = query.trim();
  if (isSong) {
    // When playing a song, search with "official audio" or "song"
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + ' song')}`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(clean)}`;
}

/**
 * Build URL for Google Search
 */
export function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
}
