
export interface ChatMessage {
  sender: 'user' | 'tessa';
  text: string;
  song?: SongLyrics | null;
}

export interface LyricPart {
    type: string;
    lines: string[];
}

export interface SongLyrics {
    title: string;
    lyrics: LyricPart[];
}