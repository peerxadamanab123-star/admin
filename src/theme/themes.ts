import { AssistantState, ThemeId } from '../types.ts';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  dotColor: string;
  bgClass: string;
  ambientGlows: {
    orb1: string;
    orb2: string;
    orb3: string;
  };
  header: {
    bg: string;
    border: string;
    brandBadge: string;
    livePill: string;
    controlButton: string;
  };
  orb: {
    glow: Record<AssistantState, string>;
    outerRing: Record<AssistantState, string>;
    innerRing: Record<AssistantState, string>;
    button: Record<AssistantState, string>;
    indicatorDot: Record<AssistantState, string>;
    endCallBtn: string;
  };
  waveform: {
    idleStroke: string;
    connectingStroke: string;
    listening: [string, string];
    speaking: [string, string];
    innerGlow: Record<AssistantState, string>;
  };
  chips: {
    container: string;
    chip: string;
  };
  toolCard: {
    bg: string;
    border: string;
    glow: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    actionBtn: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'heavy-emerald': {
    id: 'heavy-emerald',
    name: 'Heavy Mint & Obsidian',
    tagline: 'Dramatic deep obsidian with mint studio lighting',
    dotColor: '#2dd4bf',
    bgClass: 'bg-[#020509]',
    ambientGlows: {
      orb1: 'bg-teal-500/22',
      orb2: 'bg-emerald-600/20',
      orb3: 'bg-cyan-600/18',
    },
    header: {
      bg: 'bg-black/75',
      border: 'border-teal-500/25 shadow-[0_4px_30px_rgba(0,0,0,0.8)]',
      brandBadge: 'bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-400 shadow-[0_0_20px_rgba(45,212,191,0.5)]',
      livePill: 'bg-teal-500/15 text-teal-300 border-teal-400/40 shadow-[0_0_10px_rgba(45,212,191,0.2)]',
      controlButton: 'bg-zinc-950/90 border-teal-500/30 hover:border-teal-400 text-teal-200 hover:text-white',
    },
    orb: {
      glow: {
        disconnected: 'bg-gradient-to-tr from-teal-950/40 to-slate-950/40',
        connecting: 'bg-gradient-to-tr from-teal-500/30 to-emerald-600/30 animate-pulse',
        listening: 'bg-gradient-to-tr from-teal-400/45 via-emerald-500/35 to-cyan-500/30 shadow-[0_0_60px_rgba(45,212,191,0.4)]',
        speaking: 'bg-gradient-to-tr from-emerald-500/50 via-teal-400/45 to-pink-500/30 shadow-[0_0_70px_rgba(52,211,153,0.5)]',
      },
      outerRing: {
        disconnected: 'border-teal-500/20',
        connecting: 'border-teal-400/60 animate-[spin_4s_linear_infinite]',
        listening: 'border-teal-400/60 animate-[spin_10s_linear_infinite]',
        speaking: 'border-emerald-400/80 animate-[spin_7s_linear_infinite]',
      },
      innerRing: {
        disconnected: 'border-teal-500/15',
        connecting: 'border-emerald-400/50 animate-ping',
        listening: 'border-teal-300/80',
        speaking: 'border-emerald-400/90 scale-105',
      },
      button: {
        disconnected: 'bg-gradient-to-br from-[#041212] via-[#020909] to-black border-2 border-teal-500/40 shadow-[0_0_30px_rgba(45,212,191,0.25)]',
        connecting: 'bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 shadow-[0_0_40px_rgba(45,212,191,0.45)]',
        listening: 'bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-700 shadow-[0_0_55px_rgba(45,212,191,0.6)]',
        speaking: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-rose-600 shadow-[0_0_65px_rgba(52,211,153,0.65)]',
      },
      indicatorDot: {
        disconnected: 'bg-teal-700',
        connecting: 'bg-amber-400 animate-pulse',
        listening: 'bg-teal-300 animate-pulse shadow-[0_0_8px_#2dd4bf]',
        speaking: 'bg-emerald-400 animate-ping shadow-[0_0_10px_#34d399]',
      },
      endCallBtn: 'text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border-rose-500/40',
    },
    waveform: {
      idleStroke: 'rgba(45, 212, 191, 0.25)',
      connectingStroke: 'rgba(45, 212, 191, 0.6)',
      listening: ['rgba(45, 212, 191, 0.65)', 'rgba(52, 211, 153, 1.0)'],
      speaking: ['rgba(52, 211, 153, 0.7)', 'rgba(244, 63, 94, 0.95)'],
      innerGlow: {
        disconnected: 'rgba(45, 212, 191, 0.2)',
        connecting: 'rgba(45, 212, 191, 0.4)',
        listening: 'rgba(45, 212, 191, 0.7)',
        speaking: 'rgba(52, 211, 153, 0.8)',
      },
    },
    chips: {
      container: 'text-teal-300',
      chip: 'bg-[#041212]/80 border-teal-400/25 text-teal-200 hover:border-teal-300 hover:text-white hover:bg-[#071c1c]',
    },
    toolCard: {
      bg: 'bg-[#020a0a]/95',
      border: 'border-teal-400/40 shadow-[0_0_25px_rgba(45,212,191,0.25)]',
      glow: 'bg-teal-500/25',
      iconBg: 'bg-teal-500/15 border-teal-400/40',
      iconColor: 'text-teal-300',
      titleColor: 'text-teal-200',
      actionBtn: 'bg-teal-500/25 text-teal-200 hover:bg-teal-500/40 border-teal-400/40',
    },
  },

  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    tagline: 'Deep cosmic blues & soft neon aura',
    dotColor: '#38bdf8',
    bgClass: 'bg-[#050711]',
    ambientGlows: {
      orb1: 'bg-purple-900/15',
      orb2: 'bg-cyan-900/15',
      orb3: 'bg-indigo-950/25',
    },
    header: {
      bg: 'bg-slate-950/40',
      border: 'border-purple-500/15',
      brandBadge: 'bg-gradient-to-tr from-purple-600 to-cyan-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      livePill: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      controlButton: 'bg-slate-900/80 border-purple-500/20 hover:border-purple-500/40 text-slate-300 hover:text-white',
    },
    orb: {
      glow: {
        disconnected: 'bg-gradient-to-tr from-purple-900/20 to-slate-900/10',
        connecting: 'bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 animate-pulse',
        listening: 'bg-gradient-to-tr from-cyan-600/35 via-blue-600/30 to-purple-600/20',
        speaking: 'bg-gradient-to-tr from-purple-600/40 via-pink-600/35 to-cyan-500/30',
      },
      outerRing: {
        disconnected: 'border-purple-500/15',
        connecting: 'border-purple-400/50 animate-[spin_4s_linear_infinite]',
        listening: 'border-cyan-400/40 animate-[spin_12s_linear_infinite]',
        speaking: 'border-fuchsia-500/40 animate-[spin_8s_linear_infinite]',
      },
      innerRing: {
        disconnected: 'border-white/5',
        connecting: 'border-purple-400/30 animate-ping',
        listening: 'border-cyan-400/60',
        speaking: 'border-pink-500/50 scale-105',
      },
      button: {
        disconnected: 'bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-900 border border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_30px_rgba(147,51,234,0.2)]',
        connecting: 'bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-800 shadow-[0_0_35px_rgba(147,51,234,0.35)]',
        listening: 'bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 shadow-[0_0_50px_rgba(6,182,212,0.5)]',
        speaking: 'bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 shadow-[0_0_50px_rgba(236,72,153,0.5)]',
      },
      indicatorDot: {
        disconnected: 'bg-slate-500',
        connecting: 'bg-amber-400 animate-pulse',
        listening: 'bg-cyan-400 animate-pulse',
        speaking: 'bg-pink-400 animate-ping',
      },
      endCallBtn: 'text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/60 border-rose-800/40',
    },
    waveform: {
      idleStroke: 'rgba(147, 51, 234, 0.2)',
      connectingStroke: 'rgba(192, 132, 252, 0.6)',
      listening: ['rgba(6, 182, 212, 0.4)', 'rgba(56, 189, 248, 0.95)'],
      speaking: ['rgba(168, 85, 247, 0.5)', 'rgba(236, 72, 153, 0.9)'],
      innerGlow: {
        disconnected: 'rgba(168, 85, 247, 0.2)',
        connecting: 'rgba(168, 85, 247, 0.4)',
        listening: 'rgba(6, 182, 212, 0.6)',
        speaking: 'rgba(217, 70, 239, 0.6)',
      },
    },
    chips: {
      container: 'text-purple-300/80',
      chip: 'bg-slate-900/60 border-purple-500/15 text-slate-300 hover:border-purple-400/40 hover:text-white hover:bg-slate-900/90',
    },
    toolCard: {
      bg: 'bg-slate-900/90',
      border: 'border-cyan-500/30',
      glow: 'bg-cyan-500/20',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30',
      iconColor: 'text-cyan-400',
      titleColor: 'text-cyan-300',
      actionBtn: 'bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 border-cyan-500/30',
    },
  },

  'neon-cyber': {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    tagline: 'High contrast electric purples & cyans',
    dotColor: '#00f5ff',
    bgClass: 'bg-[#020206]',
    ambientGlows: {
      orb1: 'bg-fuchsia-600/25',
      orb2: 'bg-cyan-500/25',
      orb3: 'bg-purple-600/30',
    },
    header: {
      bg: 'bg-[#04040a]/70',
      border: 'border-cyan-400/30 shadow-[0_4px_25px_rgba(0,245,255,0.05)]',
      brandBadge: 'bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-400 shadow-[0_0_22px_rgba(0,245,255,0.6)]',
      livePill: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(0,245,255,0.25)]',
      controlButton: 'bg-slate-950/90 border-cyan-400/30 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_10px_rgba(0,245,255,0.15)]',
    },
    orb: {
      glow: {
        disconnected: 'bg-gradient-to-tr from-fuchsia-600/25 to-cyan-500/20',
        connecting: 'bg-gradient-to-tr from-cyan-400/40 via-fuchsia-500/40 to-purple-600/40 animate-pulse',
        listening: 'bg-gradient-to-tr from-cyan-400/50 via-teal-400/40 to-blue-500/30 shadow-[0_0_60px_rgba(0,245,255,0.4)]',
        speaking: 'bg-gradient-to-tr from-fuchsia-500/60 via-pink-500/50 to-cyan-400/40 shadow-[0_0_70px_rgba(217,70,239,0.5)]',
      },
      outerRing: {
        disconnected: 'border-cyan-400/25',
        connecting: 'border-cyan-300/70 animate-[spin_3s_linear_infinite]',
        listening: 'border-cyan-300/70 animate-[spin_10s_linear_infinite] shadow-[0_0_15px_rgba(0,245,255,0.3)]',
        speaking: 'border-fuchsia-400/80 animate-[spin_6s_linear_infinite] shadow-[0_0_20px_rgba(217,70,239,0.4)]',
      },
      innerRing: {
        disconnected: 'border-fuchsia-500/15',
        connecting: 'border-cyan-400/60 animate-ping',
        listening: 'border-cyan-300/90 shadow-[0_0_12px_rgba(0,245,255,0.5)]',
        speaking: 'border-fuchsia-400/90 scale-110 shadow-[0_0_15px_rgba(217,70,239,0.6)]',
      },
      button: {
        disconnected: 'bg-gradient-to-br from-black via-[#0d0722] to-black border-2 border-fuchsia-500/50 hover:border-cyan-400 shadow-[0_0_35px_rgba(217,70,239,0.3)]',
        connecting: 'bg-gradient-to-br from-fuchsia-600 via-purple-700 to-cyan-600 shadow-[0_0_45px_rgba(0,245,255,0.5)]',
        listening: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 shadow-[0_0_65px_rgba(0,245,255,0.7)]',
        speaking: 'bg-gradient-to-br from-fuchsia-500 via-pink-600 to-purple-700 shadow-[0_0_75px_rgba(217,70,239,0.7)]',
      },
      indicatorDot: {
        disconnected: 'bg-slate-400',
        connecting: 'bg-cyan-300 animate-pulse',
        listening: 'bg-cyan-300 animate-pulse shadow-[0_0_8px_#00f5ff]',
        speaking: 'bg-fuchsia-400 animate-ping shadow-[0_0_10px_#d946ef]',
      },
      endCallBtn: 'text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    },
    waveform: {
      idleStroke: 'rgba(0, 245, 255, 0.3)',
      connectingStroke: 'rgba(217, 70, 239, 0.8)',
      listening: ['rgba(0, 245, 255, 0.6)', 'rgba(56, 189, 248, 1.0)'],
      speaking: ['rgba(217, 70, 239, 0.8)', 'rgba(244, 63, 94, 1.0)'],
      innerGlow: {
        disconnected: 'rgba(0, 245, 255, 0.25)',
        connecting: 'rgba(217, 70, 239, 0.5)',
        listening: 'rgba(0, 245, 255, 0.8)',
        speaking: 'rgba(217, 70, 239, 0.85)',
      },
    },
    chips: {
      container: 'text-cyan-300',
      chip: 'bg-[#090518]/80 border-cyan-400/25 text-slate-200 hover:border-cyan-300 hover:text-white hover:bg-[#120a2e]/90 shadow-[0_0_10px_rgba(0,245,255,0.1)]',
    },
    toolCard: {
      bg: 'bg-[#070414]/95',
      border: 'border-cyan-400/50 shadow-[0_0_25px_rgba(0,245,255,0.2)]',
      glow: 'bg-cyan-400/30',
      iconBg: 'bg-cyan-400/15 border-cyan-400/50',
      iconColor: 'text-cyan-300',
      titleColor: 'text-cyan-300',
      actionBtn: 'bg-cyan-400/25 text-cyan-200 hover:bg-cyan-400/40 border-cyan-400/50 shadow-[0_0_12px_rgba(0,245,255,0.25)]',
    },
  },

  'pure-minimalist': {
    id: 'pure-minimalist',
    name: 'Pure Minimalist',
    tagline: 'Refined monochromatic grayscale & frosted glass',
    dotColor: '#e4e4e7',
    bgClass: 'bg-[#09090b]',
    ambientGlows: {
      orb1: 'bg-zinc-700/10',
      orb2: 'bg-zinc-500/10',
      orb3: 'bg-zinc-800/15',
    },
    header: {
      bg: 'bg-zinc-950/60',
      border: 'border-zinc-800/60',
      brandBadge: 'bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-600 shadow-[0_0_12px_rgba(255,255,255,0.1)]',
      livePill: 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50',
      controlButton: 'bg-zinc-900/80 border-zinc-700/40 hover:border-zinc-500 text-zinc-300 hover:text-white',
    },
    orb: {
      glow: {
        disconnected: 'bg-gradient-to-tr from-zinc-800/20 to-zinc-900/10',
        connecting: 'bg-gradient-to-tr from-zinc-600/20 to-zinc-800/20 animate-pulse',
        listening: 'bg-gradient-to-tr from-zinc-400/20 via-zinc-600/20 to-zinc-800/20',
        speaking: 'bg-gradient-to-tr from-zinc-300/25 via-zinc-500/20 to-zinc-700/20',
      },
      outerRing: {
        disconnected: 'border-zinc-700/30',
        connecting: 'border-zinc-400/40 animate-[spin_6s_linear_infinite]',
        listening: 'border-zinc-300/40 animate-[spin_12s_linear_infinite]',
        speaking: 'border-white/50 animate-[spin_8s_linear_infinite]',
      },
      innerRing: {
        disconnected: 'border-zinc-800',
        connecting: 'border-zinc-500/40 animate-ping',
        listening: 'border-zinc-300/50',
        speaking: 'border-white/70 scale-105',
      },
      button: {
        disconnected: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-700/50 hover:border-zinc-500 shadow-[0_0_20px_rgba(255,255,255,0.05)]',
        connecting: 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 shadow-[0_0_25px_rgba(255,255,255,0.1)]',
        listening: 'bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-800 shadow-[0_0_35px_rgba(255,255,255,0.2)]',
        speaking: 'bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-200 text-zinc-950 shadow-[0_0_45px_rgba(255,255,255,0.3)]',
      },
      indicatorDot: {
        disconnected: 'bg-zinc-600',
        connecting: 'bg-zinc-400 animate-pulse',
        listening: 'bg-zinc-200 animate-pulse',
        speaking: 'bg-white animate-ping',
      },
      endCallBtn: 'text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border-zinc-700',
    },
    waveform: {
      idleStroke: 'rgba(212, 212, 216, 0.2)',
      connectingStroke: 'rgba(212, 212, 216, 0.5)',
      listening: ['rgba(212, 212, 216, 0.35)', 'rgba(255, 255, 255, 0.95)'],
      speaking: ['rgba(244, 244, 245, 0.6)', 'rgba(255, 255, 255, 1.0)'],
      innerGlow: {
        disconnected: 'rgba(212, 212, 216, 0.15)',
        connecting: 'rgba(212, 212, 216, 0.3)',
        listening: 'rgba(255, 255, 255, 0.5)',
        speaking: 'rgba(255, 255, 255, 0.8)',
      },
    },
    chips: {
      container: 'text-zinc-400',
      chip: 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-600 hover:text-white hover:bg-zinc-900/90',
    },
    toolCard: {
      bg: 'bg-zinc-900/95',
      border: 'border-zinc-700/60 shadow-[0_0_20px_rgba(0,0,0,0.5)]',
      glow: 'bg-zinc-400/10',
      iconBg: 'bg-zinc-800 border-zinc-700',
      iconColor: 'text-zinc-200',
      titleColor: 'text-zinc-200',
      actionBtn: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700',
    },
  },

  'sakura-anime': {
    id: 'sakura-anime',
    name: 'Sakura Anime',
    tagline: 'Kawaii cyber anime with pastel blossom glows',
    dotColor: '#f472b6',
    bgClass: 'bg-[#0c0714]',
    ambientGlows: {
      orb1: 'bg-pink-600/20',
      orb2: 'bg-cyan-500/18',
      orb3: 'bg-purple-600/25',
    },
    header: {
      bg: 'bg-[#120a1f]/70',
      border: 'border-pink-500/25 shadow-[0_4px_20px_rgba(244,114,182,0.06)]',
      brandBadge: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(244,114,182,0.5)]',
      livePill: 'bg-pink-500/15 text-pink-300 border-pink-400/40 shadow-[0_0_10px_rgba(244,114,182,0.2)]',
      controlButton: 'bg-slate-900/90 border-pink-500/30 hover:border-pink-400 text-pink-200 hover:text-white',
    },
    orb: {
      glow: {
        disconnected: 'bg-gradient-to-tr from-pink-600/20 to-purple-600/15',
        connecting: 'bg-gradient-to-tr from-pink-500/35 to-cyan-400/35 animate-pulse',
        listening: 'bg-gradient-to-tr from-cyan-400/40 via-sky-500/35 to-pink-500/30 shadow-[0_0_60px_rgba(34,211,238,0.4)]',
        speaking: 'bg-gradient-to-tr from-pink-500/50 via-fuchsia-500/45 to-purple-600/40 shadow-[0_0_70px_rgba(244,114,182,0.5)]',
      },
      outerRing: {
        disconnected: 'border-pink-400/25',
        connecting: 'border-pink-400/60 animate-[spin_4s_linear_infinite]',
        listening: 'border-cyan-400/60 animate-[spin_10s_linear_infinite]',
        speaking: 'border-pink-400/80 animate-[spin_7s_linear_infinite]',
      },
      innerRing: {
        disconnected: 'border-purple-400/20',
        connecting: 'border-cyan-400/50 animate-ping',
        listening: 'border-cyan-300/80',
        speaking: 'border-pink-400/90 scale-105',
      },
      button: {
        disconnected: 'bg-gradient-to-br from-[#180d2b] to-[#0a0514] border-2 border-pink-500/40 shadow-[0_0_30px_rgba(244,114,182,0.3)]',
        connecting: 'bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-600 shadow-[0_0_40px_rgba(244,114,182,0.5)]',
        listening: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-purple-600 shadow-[0_0_55px_rgba(34,211,238,0.6)]',
        speaking: 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 shadow-[0_0_65px_rgba(244,114,182,0.7)]',
      },
      indicatorDot: {
        disconnected: 'bg-pink-400/60',
        connecting: 'bg-cyan-300 animate-pulse',
        listening: 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]',
        speaking: 'bg-pink-400 animate-ping shadow-[0_0_10px_#f472b6]',
      },
      endCallBtn: 'text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border-rose-500/40',
    },
    waveform: {
      idleStroke: 'rgba(244, 114, 182, 0.3)',
      connectingStroke: 'rgba(236, 72, 153, 0.7)',
      listening: ['rgba(34, 211, 238, 0.6)', 'rgba(168, 85, 247, 0.95)'],
      speaking: ['rgba(244, 114, 182, 0.7)', 'rgba(251, 113, 133, 1.0)'],
      innerGlow: {
        disconnected: 'rgba(244, 114, 182, 0.2)',
        connecting: 'rgba(244, 114, 182, 0.4)',
        listening: 'rgba(34, 211, 238, 0.7)',
        speaking: 'rgba(244, 114, 182, 0.8)',
      },
    },
    chips: {
      container: 'text-pink-300',
      chip: 'bg-[#1a0f2e]/80 border-pink-400/25 text-pink-200 hover:border-pink-300 hover:text-white hover:bg-[#251542]',
    },
    toolCard: {
      bg: 'bg-[#160c29]/95',
      border: 'border-pink-400/40 shadow-[0_0_20px_rgba(244,114,182,0.2)]',
      glow: 'bg-pink-500/25',
      iconBg: 'bg-pink-500/15 border-pink-400/40',
      iconColor: 'text-pink-300',
      titleColor: 'text-pink-200',
      actionBtn: 'bg-pink-500/25 text-pink-200 hover:bg-pink-500/40 border-pink-400/40',
    },
  },
};
