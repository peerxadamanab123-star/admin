/**
 * Type definitions for Janu Voice Assistant
 */

export type AssistantState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export interface ToolCallItem {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  url?: string;
  title?: string;
  message?: string;
  error?: string;
  [key: string]: any;
}

export type VoiceOption = 'Aoede' | 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export interface VoiceInfo {
  id: VoiceOption;
  name: string;
  gender: 'girl' | 'boy';
  character: string;
  description: string;
}

export const AVAILABLE_VOICES: VoiceInfo[] = [
  { id: 'Aoede', name: 'Aoede', gender: 'girl', character: '👧', description: 'Warm, vibrant & expressive' },
  { id: 'Kore', name: 'Kore', gender: 'girl', character: '👧', description: 'Calm, soft & soothing' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'girl', character: '👧', description: 'Gentle, balanced & smooth' },
  { id: 'Puck', name: 'Puck', gender: 'boy', character: '👦', description: 'Energetic, friendly & youthful' },
  { id: 'Charon', name: 'Charon', gender: 'boy', character: '👦', description: 'Deep, steady & authoritative' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'boy', character: '👦', description: 'Bold, crisp & dynamic' },
];

export type ThemeId = 'heavy-emerald' | 'midnight-blue' | 'neon-cyber' | 'pure-minimalist' | 'sakura-anime';

export interface JanuTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (args: Record<string, any>) => Promise<ToolResult>;
}

export interface ToolExecutionEvent {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: ToolResult;
  timestamp: number;
}

export interface ChromeTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
}

export type ChromeWindowState = 'closed' | 'normal' | 'maximized' | 'minimized';

export interface ChromeActionPayload {
  url?: string;
  search?: string;
  engine?: string;
  title?: string;
  state?: 'normal' | 'maximized' | 'minimized' | 'closed';
}

export interface WindowsAppInfo {
  id: string;
  name: string;
  executable: string;
  aliases: string[];
  description: string;
  category: 'productivity' | 'system' | 'browsing' | 'media' | 'utility';
  icon?: string;
}

export interface CustomVoiceShortcut {
  id: string;
  trigger: string;
  target: string; // URL or executable/app ID
  type: 'website' | 'app';
  description?: string;
}

export type HandsFreeState =
  | 'idle'
  | 'listening_for_wake_word'
  | 'wake_word_detected'
  | 'processing_command'
  | 'speaking'
  | 'paused'
  | 'error';

export interface HandsFreeConfig {
  enabled: boolean;
  wakeWord: string;
  spokenFeedback: boolean;
  voiceGender: 'female' | 'male';
  soundChime: boolean;
  desktopBridgeUrl: string;
  preferNativeWindowsChrome: boolean;
}
