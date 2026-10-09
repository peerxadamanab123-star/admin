import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  X,
  Minus,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Bot,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import { ChromeTab, ChromeWindowState } from '../types.ts';
import { ThemeConfig } from '../theme/themes.ts';

interface MaxChromeProps {
  isOpen: boolean;
  windowState: ChromeWindowState;
  onClose: () => void;
  onWindowStateChange: (state: ChromeWindowState) => void;
  initialUrl?: string;
  initialSearch?: string;
  theme: ThemeConfig;
  onVoiceCommandSimulate?: (text: string) => void;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍', queryUrl: 'https://www.google.com/search?q=' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', queryUrl: 'https://www.youtube.com/results?search_query=' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', icon: '📖', queryUrl: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', queryUrl: 'https://github.com/search?q=' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', icon: '⚡', queryUrl: 'https://hn.algolia.com/?q=' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: '💬', queryUrl: 'https://www.reddit.com/search/?q=' },
  { name: 'OpenAI', url: 'https://openai.com', icon: '🤖', queryUrl: 'https://www.google.com/search?q=site:openai.com+' },
  { name: 'Syed Manan', url: 'https://github.com/SyedManan', icon: '👑', queryUrl: 'https://github.com/search?q=Syed+Manan' },
];

export const MaxChrome: React.FC<MaxChromeProps> = ({
  isOpen,
  windowState,
  onClose,
  onWindowStateChange,
  initialUrl,
  initialSearch,
  theme,
  onVoiceCommandSimulate,
}) => {
  const [tabs, setTabs] = useState<ChromeTab[]>([
    {
      id: 'tab-1',
      title: 'MAX Chrome - Start Page',
      url: 'about:start',
      favicon: '🌐',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [omniboxInput, setOmniboxInput] = useState<string>('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'youtube' | 'wikipedia' | 'duckduckgo'>('google');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [readerContent, setReaderContent] = useState<{ title: string; desc: string; domain: string } | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync omnibox input when active tab changes
  useEffect(() => {
    if (activeTab) {
      if (activeTab.url === 'about:start') {
        setOmniboxInput('');
      } else {
        setOmniboxInput(activeTab.url);
      }
      setIframeError(false);
      setReaderContent(null);
    }
  }, [activeTabId, activeTab?.url]);

  // Handle external navigation requests (from voice tool execution or props)
  useEffect(() => {
    if (initialUrl) {
      navigateTo(initialUrl);
    } else if (initialSearch) {
      performSearch(initialSearch, searchEngine);
    }
  }, [initialUrl, initialSearch]);

  const navigateTo = (inputUrl: string, customTitle?: string) => {
    let target = inputUrl.trim();
    if (!target) return;

    // Check if it's a search query or a valid URL
    const isDomainOrUrl = /^https?:\/\//i.test(target) || /^[\w-]+\.[a-z]{2,}/i.test(target);

    if (!isDomainOrUrl && !target.startsWith('about:')) {
      performSearch(target, searchEngine);
      return;
    }

    if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('about:')) {
      target = `https://${target}`;
    }

    let parsedTitle = customTitle || target;
    try {
      if (target.startsWith('http')) {
        const u = new URL(target);
        parsedTitle = customTitle || u.hostname.replace(/^www\./, '');
      }
    } catch (_) {}

    setIsLoading(true);
    setIframeError(false);

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: target,
              title: parsedTitle,
            }
          : tab
      )
    );
    setOmniboxInput(target);

    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const performSearch = (query: string, engine = searchEngine) => {
    const q = query.trim();
    if (!q) return;

    let searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    let title = `Google: ${q}`;

    if (engine === 'youtube') {
      searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      title = `YouTube: ${q}`;
    } else if (engine === 'wikipedia') {
      searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`;
      title = `Wikipedia: ${q}`;
    } else if (engine === 'duckduckgo') {
      searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
      title = `DuckDuckGo: ${q}`;
    }

    setIsLoading(true);
    setIframeError(false);

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              url: searchUrl,
              title,
            }
          : tab
      )
    );
    setOmniboxInput(searchUrl);

    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const handleOmniboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!omniboxInput.trim()) return;
    navigateTo(omniboxInput);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: ChromeTab = {
      id: newId,
      title: 'New Tab',
      url: 'about:start',
      favicon: '🌐',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (idToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // If closing last tab, reset to start page
      setTabs([
        {
          id: 'tab-1',
          title: 'MAX Chrome - Start Page',
          url: 'about:start',
          favicon: '🌐',
        },
      ]);
      setActiveTabId('tab-1');
      return;
    }

    const filtered = tabs.filter((t) => t.id !== idToClose);
    setTabs(filtered);

    if (activeTabId === idToClose) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const handleCopyUrl = () => {
    if (activeTab?.url && activeTab.url !== 'about:start') {
      navigator.clipboard?.writeText(activeTab.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeError(false);
    if (iframeRef.current && activeTab?.url && activeTab.url !== 'about:start') {
      iframeRef.current.src = activeTab.url;
    }
    setTimeout(() => setIsLoading(false), 600);
  };

  // Convert URLs for cleaner iframe viewing when possible
  const getEmbeddableUrl = (url: string) => {
    if (!url || url === 'about:start') return '';
    try {
      const u = new URL(url);
      // YouTube video embed conversion
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1`;
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace(/^\//, '');
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      // Wikipedia mobile view (less restrictive headers)
      if (u.hostname.includes('wikipedia.org') && !u.hostname.includes('.m.')) {
        return url.replace('wikipedia.org', 'm.wikipedia.org');
      }
      return url;
    } catch {
      return url;
    }
  };

  if (!isOpen || windowState === 'closed') {
    return null;
  }

  // Minimized state: sleek floating Chrome pill on bottom-right
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-3 right-28 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button
          onClick={() => onWindowStateChange('normal')}
          className="flex items-center gap-2 rounded-full bg-slate-950/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200 border border-teal-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-cyan-400 hover:text-white transition-all cursor-pointer group"
          title="Restore MAX Chrome"
        >
          {/* Chrome Colored Orb */}
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-400 p-0.5">
            <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </div>
          </div>
          <span className="max-w-[150px] truncate text-slate-200 group-hover:text-cyan-300">
            {activeTab?.title || 'MAX Chrome'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
            Active
          </span>
          <Maximize2 className="h-3 w-3 text-slate-400 group-hover:text-white" />
        </button>
      </div>
    );
  }

  const isMaximized = windowState === 'maximized';
  const embedUrl = getEmbeddableUrl(activeTab?.url || '');

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col overflow-hidden bg-slate-950/95 border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl ${
        isMaximized
          ? 'inset-2 rounded-2xl'
          : 'inset-x-2 sm:inset-x-6 md:inset-x-12 top-6 bottom-6 max-w-6xl mx-auto rounded-2xl'
      }`}
    >
      {/* 1. CHROME TITLE BAR & TABS */}
      <div className="flex items-center justify-between bg-slate-900/90 px-3 pt-2.5 pb-1 border-b border-slate-800 select-none">
        {/* Tabs Row */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[calc(100%-140px)]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group relative flex items-center gap-2 rounded-t-xl px-3 py-1.5 text-xs font-medium cursor-pointer transition-all max-w-[200px] border-t border-x ${
                  isActive
                    ? 'bg-slate-950 text-white border-slate-700/80 shadow-[0_-2px_10px_rgba(0,0,0,0.4)]'
                    : 'bg-slate-900/40 text-slate-400 border-transparent hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                {/* Tab Icon */}
                <span className="text-xs shrink-0">{tab.favicon || '🌐'}</span>
                <span className="truncate text-[11px] font-sans">{tab.title}</span>
                {/* Close Tab Button */}
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Close tab"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={handleNewTab}
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Open new tab"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Chrome Assistant Identity & Window Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-950/80 px-2.5 py-1 border border-teal-500/30">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
              MAX Chrome • Syed Manan
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Minimize */}
            <button
              onClick={() => onWindowStateChange('minimized')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Minimize"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            {/* Maximize / Restore */}
            <button
              onClick={() => onWindowStateChange(isMaximized ? 'normal' : 'maximized')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={isMaximized ? 'Restore window' : 'Maximize window'}
            >
              {isMaximized ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-300 transition-colors"
              title="Close Chrome"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHROME NAVIGATION & OMNIBOX TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950 px-3 py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (iframeRef.current?.contentWindow) {
                  try {
                    iframeRef.current.contentWindow.history.back();
                  } catch (_) {}
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (iframeRef.current?.contentWindow) {
                  try {
                    iframeRef.current.contentWindow.history.forward();
                  } catch (_) {}
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Forward"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleReload}
              className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
                isLoading ? 'animate-spin text-cyan-400' : ''
              }`}
              title="Reload page"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateTo('about:start', 'Start Page')}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Start page"
            >
              <Home className="h-4 w-4" />
            </button>
          </div>

          {/* Engine Selector on Mobile */}
          <div className="sm:hidden">
            <select
              value={searchEngine}
              onChange={(e) => setSearchEngine(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-[10px] rounded px-1.5 py-1 text-slate-300"
            >
              <option value="google">Google</option>
              <option value="youtube">YouTube</option>
              <option value="wikipedia">Wikipedia</option>
              <option value="duckduckgo">DuckDuckGo</option>
            </select>
          </div>
        </div>

        {/* Omnibox (Search / Address Bar) */}
        <form onSubmit={handleOmniboxSubmit} className="flex-1 w-full relative">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3.5 py-1.5 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all shadow-inner">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={omniboxInput}
              onChange={(e) => setOmniboxInput(e.target.value)}
              placeholder="Search Google or type a web address (e.g. youtube.com, github.com)..."
              className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono"
            />
            {omniboxInput && (
              <button
                type="button"
                onClick={() => setOmniboxInput('')}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-1 rounded-full bg-cyan-600/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-600/50 hover:text-white transition-colors"
            >
              <Search className="h-3 w-3" />
              <span>Go</span>
            </button>
          </div>
        </form>

        {/* Search Engine Selector & External Button */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <select
            value={searchEngine}
            onChange={(e) => setSearchEngine(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-400"
            title="Default Search Engine"
          >
            <option value="google">Google</option>
            <option value="youtube">YouTube</option>
            <option value="wikipedia">Wikipedia</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </select>

          {activeTab?.url && activeTab.url !== 'about:start' && (
            <>
              <button
                onClick={handleCopyUrl}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title={copiedUrl ? 'Copied!' : 'Copy URL'}
              >
                {copiedUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Open in external browser window"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* 3. BOOKMARKS BAR */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-900/60 px-3 py-1 border-b border-slate-800/60 text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1 shrink-0">
          Quick Access:
        </span>
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => navigateTo(bm.url, bm.name)}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors shrink-0 text-[11px]"
          >
            <span>{bm.icon}</span>
            <span>{bm.name}</span>
          </button>
        ))}
      </div>

      {/* Animated Loading Bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-500 animate-[pulse_1s_infinite] w-full" />
        </div>
      )}

      {/* 4. CHROME VIEWPORT / CONTENT CANVAS */}
      <div className="relative flex-1 bg-[#0a0f18] overflow-hidden flex flex-col">
        {/* START PAGE (when about:start is active) */}
        {activeTab?.url === 'about:start' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center text-center">
            {/* Chrome Futuristic Orb */}
            <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-teal-400 p-1 shadow-[0_0_40px_rgba(45,212,191,0.3)]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                <Compass className="h-10 w-10 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              MAX Chrome
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-teal-300/90 max-w-md">
              Your voice-controlled AI browser. MAX can browse, search, and navigate directly on your command.
            </p>

            {/* Quick Search Box inside Start Page */}
            <div className="mt-6 w-full max-w-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (omniboxInput.trim()) performSearch(omniboxInput);
                }}
                className="flex items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-2.5 border border-slate-700 shadow-xl focus-within:border-cyan-400"
              >
                <Search className="h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={omniboxInput}
                  onChange={(e) => setOmniboxInput(e.target.value)}
                  placeholder="What would you like MAX to look up today?"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-3 py-1 text-xs font-semibold text-white shadow hover:opacity-90 transition-opacity"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quick Grid Bookmarks */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {DEFAULT_BOOKMARKS.map((bm) => (
                <button
                  key={bm.name}
                  onClick={() => navigateTo(bm.url, bm.name)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {bm.icon}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {bm.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Voice Control Prompts */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Speak to MAX:</span>
              <button
                onClick={() => onVoiceCommandSimulate?.('Open YouTube on Chrome')}
                className="rounded-full bg-slate-900 px-3 py-1 text-[11px] border border-slate-800 hover:border-teal-500 hover:text-white transition-all"
              >
                &ldquo;Open YouTube on your Chrome&rdquo;
              </button>
              <button
                onClick={() => onVoiceCommandSimulate?.('Search latest AI news')}
                className="rounded-full bg-slate-900 px-3 py-1 text-[11px] border border-slate-800 hover:border-teal-500 hover:text-white transition-all"
              >
                &ldquo;Search latest AI news&rdquo;
              </button>
              <button
                onClick={() => onVoiceCommandSimulate?.('Open Wikipedia')}
                className="rounded-full bg-slate-900 px-3 py-1 text-[11px] border border-slate-800 hover:border-teal-500 hover:text-white transition-all"
              >
                &ldquo;Open Wikipedia&rdquo;
              </button>
            </div>
          </div>
        ) : (
          /* EMBEDDED WEB VIEW / SMART BROWSER FRAME */
          <div className="relative flex-1 w-full h-full bg-white flex flex-col">
            {/* If the site is embeddable */}
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={activeTab?.title || 'MAX Browser Content'}
              className="w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              onLoad={() => setIsLoading(false)}
              onError={() => setIframeError(true)}
            />

            {/* In-Frame Security Notice / Fallback Bar for restrictive sites */}
            <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  Browsing: <strong className="text-slate-200">{activeTab?.title}</strong>
                </span>
                <span className="hidden md:inline font-mono text-[10px] text-slate-500 truncate max-w-xs">
                  ({activeTab?.url})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('about:start', 'Start Page')}
                  className="hover:text-white underline text-[10px]"
                >
                  Start Page
                </button>
                <span className="text-slate-700">•</span>
                <a
                  href={activeTab?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <span>Open Full Window</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM STATUS BAR & MAX DIRECT ACCESS BADGE */}
      <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-300">MAX Direct Access Engine</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-teal-400/90 font-medium">
            Architect: Syed Manan
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono text-[10px]">
            Tabs: {tabs.length}
          </span>
          <button
            onClick={() => onWindowStateChange('minimized')}
            className="text-slate-400 hover:text-white text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-800"
          >
            Minimize
          </button>
        </div>
      </div>
    </div>
  );
};
