export enum ChatMode {
  CASUAL = 'casual',
  STUDY = 'study',
  SUPPORT = 'support',
  CRISIS = 'crisis'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: {
    data: string; // base64
    mimeType: string;
  };
  timestamp: number;
  mode: ChatMode;
}

export interface MoodLog {
  id: string;
  score: number; // 1-5
  note: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AppState {
  user: User | null;
  currentMode: ChatMode;
  messages: Message[];
  moodLogs: MoodLog[];
  journalEntries: JournalEntry[];
  isCrisisMode: boolean;
  emergencyTriggered: boolean;
  lastUserInteraction: number;
}