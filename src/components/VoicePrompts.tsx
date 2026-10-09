import React from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeConfig } from '../theme/themes.ts';

interface VoicePromptsProps {
  theme: ThemeConfig;
  onSelectPrompt?: (text: string) => void;
}

const PROMPT_SUGGESTIONS = [
  { icon: '🌐', label: 'Max, open Chrome / Chrome kholo' },
  { icon: '🔍', label: 'Chrome pe AI news search karo' },
  { icon: '👑', label: 'Who created you? (Syed Manan!)' },
  { icon: '🎙️', label: 'Boy voice me baat karo / Girl voice' },
  { icon: '🇮🇳', label: 'Tumhe kisne banaya? Kaise ho?' },
  { icon: '🖥️', label: 'Share my screen' },
  { icon: '🎨', label: 'Change background to Neon Cyber' },
  { icon: '🚀', label: 'Open YouTube on your Chrome' },
  { icon: '⚡', label: 'What are latest AI tech breakthroughs?' },
];

export const VoicePrompts: React.FC<VoicePromptsProps> = ({ theme }) => {
  return (
    <div className="relative z-10 w-full max-w-2xl px-3 py-3 text-center">
      <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold mb-2.5 transition-colors ${theme.chips.container}`}>
        <Sparkles className="h-3.5 w-3.5" />
        <span>Voice Commands & Bilingual Prompts (English & हिन्दी):</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {PROMPT_SUGGESTIONS.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs backdrop-blur-md border transition-all duration-300 ${theme.chips.chip}`}
          >
            <span className="text-sm select-none">{item.icon}</span>
            <span className="font-medium tracking-wide">&ldquo;{item.label}&rdquo;</span>
          </div>
        ))}
      </div>
    </div>
  );
};
