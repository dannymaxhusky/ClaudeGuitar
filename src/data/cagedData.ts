// CAGED 和弦指型系统数据 — 基于《吉他新思维》第5章
// 每个形状存储在 C 调（根音为 C）的品格位置，转调时整体移位
//
// frets: [弦6(低E), 弦5, 弦4, 弦3, 弦2, 弦1(高E)]
// null = 不弹(X), 0 = 空弦, 正整数 = 品格
// rootString: 根音在哪根弦上（0=弦6，5=弦1）

export type StringFret = number | null; // null=静音, 0=空弦, 1+=品

export interface CAGEDShape {
  shape: "C" | "A" | "G" | "E" | "D";   // 指型名称
  frets: [StringFret, StringFret, StringFret, StringFret, StringFret, StringFret];
  fingers: [number | null, number | null, number | null, number | null, number | null, number | null];
  barre?: { fret: number; from: number; to: number };
  rootStrings: number[];    // 根音所在弦的索引（0=低E）
  baseFret: number;         // 相对品格（1=第一品）
}

// ── 大三和弦五种指型（以 C 调为基准，根音=C）──────────────────
export const MAJOR_SHAPES: CAGEDShape[] = [
  {
    shape: "C",
    frets:   [null, 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, 0, 1, 0],
    rootStrings: [1, 4],   // 第5弦和第2弦
    baseFret: 1,
  },
  {
    shape: "A",
    frets:   [null, 0, 2, 2, 2, 0],
    fingers: [null, 0, 1, 2, 3, 0],
    barre: { fret: 2, from: 1, to: 3 },
    rootStrings: [1],       // 第5弦
    baseFret: 1,
  },
  {
    shape: "G",
    frets:   [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
    rootStrings: [0, 5],    // 第6弦和第1弦
    baseFret: 1,
  },
  {
    shape: "E",
    frets:   [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    rootStrings: [0],       // 第6弦
    baseFret: 1,
  },
  {
    shape: "D",
    frets:   [null, null, 0, 2, 3, 2],
    fingers: [null, null, 0, 1, 3, 2],
    rootStrings: [3],       // 第4弦
    baseFret: 1,
  },
];

// ── 小三和弦五种指型 ─────────────────────────────────────────
export const MINOR_SHAPES: CAGEDShape[] = [
  {
    shape: "C",
    frets:   [null, 3, 1, 0, 1, 3],
    fingers: [null, 3, 1, 0, 1, 4],
    rootStrings: [1, 4],
    baseFret: 1,
  },
  {
    shape: "A",
    frets:   [null, 0, 2, 2, 1, 0],
    fingers: [null, 0, 2, 3, 1, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "G",
    frets:   [3, 1, 0, 0, 3, 3],
    fingers: [2, 1, 0, 0, 3, 4],
    barre: { fret: 3, from: 4, to: 5 },
    rootStrings: [0, 5],
    baseFret: 1,
  },
  {
    shape: "E",
    frets:   [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "D",
    frets:   [null, null, 0, 2, 3, 1],
    fingers: [null, null, 0, 2, 3, 1],
    rootStrings: [3],
    baseFret: 1,
  },
];

// ── 大七和弦五种指型 ─────────────────────────────────────────
export const MAJ7_SHAPES: CAGEDShape[] = [
  {
    shape: "C",
    frets:   [null, 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, 0, 0, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "A",
    frets:   [null, 0, 2, 1, 2, 0],
    fingers: [null, 0, 2, 1, 3, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "G",
    frets:   [3, 2, 0, 0, 0, 2],
    fingers: [2, 1, 0, 0, 0, 3],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "E",
    frets:   [0, 2, 1, 1, 0, 0],
    fingers: [0, 3, 2, 1, 0, 0],
    barre: { fret: 1, from: 2, to: 3 },
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "D",
    frets:   [null, null, 0, 2, 2, 2],
    fingers: [null, null, 0, 1, 2, 3],
    rootStrings: [3],
    baseFret: 1,
  },
];

// ── 属七和弦五种指型 ─────────────────────────────────────────
export const DOM7_SHAPES: CAGEDShape[] = [
  {
    shape: "C",
    frets:   [null, 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "A",
    frets:   [null, 0, 2, 0, 2, 0],
    fingers: [null, 0, 2, 0, 3, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "G",
    frets:   [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "E",
    frets:   [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "D",
    frets:   [null, null, 0, 2, 1, 2],
    fingers: [null, null, 0, 2, 1, 3],
    rootStrings: [3],
    baseFret: 1,
  },
];

// ── 小七和弦五种指型 ─────────────────────────────────────────
export const M7_SHAPES: CAGEDShape[] = [
  {
    shape: "C",
    frets:   [null, 3, 1, 3, 1, 3],
    fingers: [null, 4, 1, 3, 1, 2],
    barre: { fret: 1, from: 3, to: 5 },
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "A",
    frets:   [null, 0, 2, 0, 1, 0],
    fingers: [null, 0, 2, 0, 1, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "G",
    frets:   [3, 1, 0, 0, 3, 3],
    fingers: [2, 1, 0, 0, 3, 4],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "E",
    frets:   [0, 2, 0, 0, 0, 0],
    fingers: [0, 2, 0, 0, 0, 0],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "D",
    frets:   [null, null, 0, 2, 1, 1],
    fingers: [null, null, 0, 2, 1, 1],
    barre: { fret: 1, from: 4, to: 5 },
    rootStrings: [3],
    baseFret: 1,
  },
];

// ── 半减七和弦（m7b5）五种指型 ──────────────────────────────
export const HALFDIM_SHAPES: CAGEDShape[] = [
  {
    shape: "C",
    frets:   [null, 3, 1, 3, 2, null],
    fingers: [null, 4, 1, 3, 2, null],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "A",
    frets:   [null, 0, 1, 2, 1, 0],
    fingers: [null, 0, 1, 3, 2, 0],
    rootStrings: [1],
    baseFret: 1,
  },
  {
    shape: "G",
    frets:   [3, 1, 3, 3, 3, null],
    fingers: [2, 1, 3, 3, 3, null],
    barre: { fret: 3, from: 2, to: 4 },
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "E",
    frets:   [0, 1, 2, 0, 0, null],
    fingers: [0, 1, 2, 0, 0, null],
    rootStrings: [0],
    baseFret: 1,
  },
  {
    shape: "D",
    frets:   [null, null, 0, 1, 1, 1],
    fingers: [null, null, 0, 1, 1, 1],
    barre: { fret: 1, from: 3, to: 5 },
    rootStrings: [3],
    baseFret: 1,
  },
];

// ── 和弦类型汇总 ─────────────────────────────────────────────
export const CHORD_TYPES = [
  { id: "major",   label: "大三和弦",   symbol: "",      shapes: MAJOR_SHAPES,   color: "bg-sky-500" },
  { id: "minor",   label: "小三和弦",   symbol: "m",     shapes: MINOR_SHAPES,   color: "bg-indigo-500" },
  { id: "maj7",    label: "大七和弦",   symbol: "maj7",  shapes: MAJ7_SHAPES,    color: "bg-emerald-500" },
  { id: "dom7",    label: "属七和弦",   symbol: "7",     shapes: DOM7_SHAPES,    color: "bg-amber-500" },
  { id: "m7",      label: "小七和弦",   symbol: "m7",    shapes: M7_SHAPES,      color: "bg-violet-500" },
  { id: "halfdim", label: "半减七和弦", symbol: "m7♭5",  shapes: HALFDIM_SHAPES, color: "bg-rose-500" },
] as const;

export type ChordTypeId = (typeof CHORD_TYPES)[number]["id"];

// ── 12 个音名 ────────────────────────────────────────────────
export const ROOTS = ["C", "C#/D♭", "D", "D#/E♭", "E", "F", "F#/G♭", "G", "G#/A♭", "A", "A#/B♭", "B"] as const;
export const ROOT_SEMITONES: Record<string, number> = {
  "C": 0, "C#/D♭": 1, "D": 2, "D#/E♭": 3, "E": 4, "F": 5,
  "F#/G♭": 6, "G": 7, "G#/A♭": 8, "A": 9, "A#/B♭": 10, "B": 11,
};

// ── 转调工具函数 ─────────────────────────────────────────────
// 将一个指型从 C 调移位到目标根音
// 返回调整后的 frets 数组和新的 baseFret
export function transposeShape(
  shape: CAGEDShape,
  targetRoot: string
): { frets: (number | null)[]; baseFret: number; barre?: CAGEDShape["barre"] } {
  const semitones = ROOT_SEMITONES[targetRoot] ?? 0;
  if (semitones === 0) {
    return { frets: [...shape.frets], baseFret: shape.baseFret, barre: shape.barre };
  }

  // 找出指型中最低的非空弦品格（不含空弦）
  const pressedFrets = shape.frets.filter((f): f is number => f !== null && f > 0);
  const minFret = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 0;

  const newFrets = shape.frets.map((f) => {
    if (f === null) return null;
    if (f === 0) return f; // 空弦暂保留，移调后有些指型空弦会变成按弦
    return f + semitones;
  });

  const newBaseFret = shape.baseFret + semitones;
  const newBarre = shape.barre
    ? { ...shape.barre, fret: shape.barre.fret + semitones }
    : undefined;

  return { frets: newFrets, baseFret: newBaseFret, barre: newBarre };
}

// 开放弦音高：[E2, A2, D3, G3, B3, E4]（半音，以C0=0为基准）
export const OPEN_STRING_PITCHES = [40, 45, 50, 55, 59, 64]; // MIDI音高

// 空弦音名
export const OPEN_STRING_NAMES = ["E", "A", "D", "G", "B", "E"];

// 各品实际音名（C开始）
const ALL_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function getFretNote(stringIdx: number, fret: number): string {
  const base = OPEN_STRING_PITCHES[stringIdx];
  return ALL_NOTES[(base + fret) % 12];
}
