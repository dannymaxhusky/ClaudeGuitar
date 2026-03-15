// Chord diagram data
// frets: [string6, string5, string4, string3, string2, string1] (low E to high E)
// null = muted (X), 0 = open, 1-N = fret number
// fingers: optional finger numbers (1=index, 2=middle, 3=ring, 4=pinky)
// barre: { fret, fromString, toString } for barre chords

export interface ChordDiagramData {
  name: string;
  frets: (number | null)[];  // 6 strings, low E first
  fingers: (number | null)[];
  barre?: { fret: number; from: number; to: number }; // string indices (0=low E)
  baseFret?: number; // if not starting at fret 1
}

const chords: Record<string, ChordDiagramData> = {
  // ─── Open Chords ───
  "C": {
    name: "C",
    frets: [null, 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, 0, 1, 0],
  },
  "Cmaj7": {
    name: "Cmaj7",
    frets: [null, 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, 0, 0, 0],
  },
  "C7": {
    name: "C7",
    frets: [null, 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, 0],
  },
  "D": {
    name: "D",
    frets: [null, null, 0, 2, 3, 2],
    fingers: [null, null, 0, 1, 3, 2],
  },
  "Dm": {
    name: "Dm",
    frets: [null, null, 0, 2, 3, 1],
    fingers: [null, null, 0, 2, 3, 1],
  },
  "Dm7": {
    name: "Dm7",
    frets: [null, null, 0, 2, 1, 1],
    fingers: [null, null, 0, 2, 1, 1],
    barre: { fret: 1, from: 4, to: 5 },
  },
  "D7": {
    name: "D7",
    frets: [null, null, 0, 2, 1, 2],
    fingers: [null, null, 0, 2, 1, 3],
  },
  "E": {
    name: "E",
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  "Em": {
    name: "Em",
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
  "Em7": {
    name: "Em7",
    frets: [0, 2, 0, 0, 0, 0],
    fingers: [0, 2, 0, 0, 0, 0],
  },
  "E7": {
    name: "E7",
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
  },
  "F": {
    name: "F",
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barre: { fret: 1, from: 0, to: 5 },
  },
  "Fmaj7": {
    name: "Fmaj7",
    frets: [null, null, 3, 2, 1, 0],
    fingers: [null, null, 3, 2, 1, 0],
  },
  "F#m": {
    name: "F#m",
    frets: [2, 4, 4, 2, 2, 2],
    fingers: [1, 3, 4, 1, 1, 1],
    barre: { fret: 2, from: 0, to: 5 },
  },
  "G": {
    name: "G",
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
  },
  "G7": {
    name: "G7",
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
  },
  "A": {
    name: "A",
    frets: [null, 0, 2, 2, 2, 0],
    fingers: [null, 0, 1, 2, 3, 0],
  },
  "Am": {
    name: "Am",
    frets: [null, 0, 2, 2, 1, 0],
    fingers: [null, 0, 2, 3, 1, 0],
  },
  "Am7": {
    name: "Am7",
    frets: [null, 0, 2, 0, 1, 0],
    fingers: [null, 0, 2, 0, 1, 0],
  },
  "A7": {
    name: "A7",
    frets: [null, 0, 2, 0, 2, 0],
    fingers: [null, 0, 2, 0, 3, 0],
  },
  "B7": {
    name: "B7",
    frets: [null, 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, 0, 4],
  },
  "Bm": {
    name: "Bm",
    frets: [null, 2, 4, 4, 3, 2],
    fingers: [null, 1, 3, 4, 2, 1],
    barre: { fret: 2, from: 1, to: 5 },
  },
  // ─── 转调常用 ───
  "E/G#": {
    name: "E/G#",
    frets: [4, 2, 2, 1, 0, 0],
    fingers: [4, 2, 3, 1, 0, 0],
  },
  "G/B": {
    name: "G/B",
    frets: [null, 2, 0, 0, 0, 3],
    fingers: [null, 1, 0, 0, 0, 3],
  },
};

export function getChordDiagram(chordName: string): ChordDiagramData | null {
  // Direct match
  if (chords[chordName]) return chords[chordName];
  // Try stripping suffixes for approximation
  const base = chordName.replace(/\(.*\)/, "").trim();
  if (chords[base]) return chords[base];
  return null;
}

export default chords;
