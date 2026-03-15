export interface StringNote {
  string: number;   // 1-6, 1 = high E
  fret: number;     // 0 = open string
  note: string;     // e.g. "E4", "C3"
  technique: string | null;
}

export interface Beat {
  beat: number;
  strings: StringNote[];
  chord: string | null;
  chordType: string | null;
}

export interface Measure {
  measureNumber: number;
  beats: Beat[];
}

// Chord chart (lyrics + chords view)
export interface ChordOnLine {
  chord: string;
  position: number; // character index in lyrics where chord change happens (for visual alignment)
  beat?: number;    // 0-indexed beat offset within this line (for accurate playback timing)
}

// Precise tab step: one vertical slice of a 6-string tab
// strings[0] = string 1 (high e), strings[5] = string 6 (low E)
// value: number = fret, "x" = muted, null = not played
export type StringFret = number | "x" | null;
export interface TabStep {
  strings: [StringFret, StringFret, StringFret, StringFret, StringFret, StringFret];
}

export interface ChordLine {
  lyrics: string;   // empty string for instrumental lines
  measures?: number; // how many measures this line spans (default 1)
  strumPattern?: string; // simple notation for strum sections (fallback / overview)
  tabSteps?: TabStep[];  // precise 6-string step-by-step tab (fingerpicking / complex intro)
  chords: ChordOnLine[];
}

export interface ChordSection {
  name: string;     // e.g. "前奏", "主歌", "副歌", "间奏", "尾奏"
  strumPattern?: string; // e.g. "↓ ↓↑ ↑ ↓↑" or "6 4 3 2 1 2" for arpeggio
  lines: ChordLine[];
}

export interface ChordChart {
  sections: ChordSection[];
}

export interface TabAnalysis {
  title: string;
  key: string;
  timeSignature: string;
  tempo: string;
  capo: string | null;
  bpm: number | null;
  totalPages: number;
  measures: Measure[];
  chordProgression: string[];
  scale: string;
  techniques: string[];
  analysis: string;
  chordChart: ChordChart;
}

export interface SavedSong {
  id: string;
  savedAt: number; // timestamp
  analysis: TabAnalysis;
}
