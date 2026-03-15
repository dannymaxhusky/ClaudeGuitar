// 乐理知识库数据 — 基于 NiceChord《好和弦》
// 作者：官大为（Wiwi）

// ── 和弦代号系统 ──────────────────────────────────────────────
export interface ChordSymbolEntry {
  symbol: string;
  name: string;
  nameCN: string;
  formula: string;         // 音程构成，如 "1 3 5"
  intervals: string;       // 半音数，如 "0 4 7"
  example: string;         // 如 "Cmaj7"
  notes: string;           // 如 "C E G B"
  color: string;           // tailwind bg color class
}

export const CHORD_SYMBOLS: ChordSymbolEntry[] = [
  // ── 三和弦 ──
  { symbol: "",        name: "Major",              nameCN: "大三和弦",       formula: "1 3 5",       intervals: "0 4 7",   example: "C",      notes: "C E G",       color: "bg-sky-100 border-sky-300" },
  { symbol: "m",       name: "Minor",              nameCN: "小三和弦",       formula: "1 ♭3 5",      intervals: "0 3 7",   example: "Cm",     notes: "C E♭ G",      color: "bg-indigo-100 border-indigo-300" },
  { symbol: "dim",     name: "Diminished",         nameCN: "减三和弦",       formula: "1 ♭3 ♭5",     intervals: "0 3 6",   example: "Cdim",   notes: "C E♭ G♭",     color: "bg-rose-100 border-rose-300" },
  { symbol: "aug",     name: "Augmented",          nameCN: "增三和弦",       formula: "1 3 ♯5",      intervals: "0 4 8",   example: "Caug",   notes: "C E G♯",      color: "bg-orange-100 border-orange-300" },
  { symbol: "sus4",    name: "Suspended 4th",      nameCN: "挂四和弦",       formula: "1 4 5",       intervals: "0 5 7",   example: "Csus4",  notes: "C F G",       color: "bg-teal-100 border-teal-300" },
  { symbol: "sus2",    name: "Suspended 2nd",      nameCN: "挂二和弦",       formula: "1 2 5",       intervals: "0 2 7",   example: "Csus2",  notes: "C D G",       color: "bg-cyan-100 border-cyan-300" },
  // ── 七和弦 ──
  { symbol: "maj7",    name: "Major 7th",          nameCN: "大七和弦",       formula: "1 3 5 7",     intervals: "0 4 7 11", example: "Cmaj7",  notes: "C E G B",     color: "bg-sky-100 border-sky-300" },
  { symbol: "7",       name: "Dominant 7th",       nameCN: "属七和弦",       formula: "1 3 5 ♭7",    intervals: "0 4 7 10", example: "C7",     notes: "C E G B♭",    color: "bg-amber-100 border-amber-300" },
  { symbol: "m7",      name: "Minor 7th",          nameCN: "小七和弦",       formula: "1 ♭3 5 ♭7",   intervals: "0 3 7 10", example: "Cm7",    notes: "C E♭ G B♭",   color: "bg-indigo-100 border-indigo-300" },
  { symbol: "m(maj7)", name: "Minor Major 7th",    nameCN: "小大七和弦",     formula: "1 ♭3 5 7",    intervals: "0 3 7 11", example: "Cm(maj7)", notes: "C E♭ G B",  color: "bg-violet-100 border-violet-300" },
  { symbol: "m7♭5",   name: "Half Diminished",    nameCN: "半减七和弦",     formula: "1 ♭3 ♭5 ♭7",  intervals: "0 3 6 10", example: "Cm7♭5",  notes: "C E♭ G♭ B♭",  color: "bg-rose-100 border-rose-300" },
  { symbol: "dim7",    name: "Diminished 7th",     nameCN: "减七和弦",       formula: "1 ♭3 ♭5 ♭♭7", intervals: "0 3 6 9",  example: "Cdim7",  notes: "C E♭ G♭ B♭♭", color: "bg-red-100 border-red-300" },
  { symbol: "maj7♯5", name: "Augmented Major 7th", nameCN: "增大七和弦",    formula: "1 3 ♯5 7",    intervals: "0 4 8 11", example: "Cmaj7♯5", notes: "C E G♯ B",   color: "bg-orange-100 border-orange-300" },
  // ── 延伸音 ──
  { symbol: "add9",    name: "Add 9",              nameCN: "加九和弦",       formula: "1 3 5 9",     intervals: "0 4 7 14", example: "Cadd9",  notes: "C E G D",     color: "bg-green-100 border-green-300" },
  { symbol: "maj9",    name: "Major 9th",          nameCN: "大九和弦",       formula: "1 3 5 7 9",   intervals: "0 4 7 11 14", example: "Cmaj9", notes: "C E G B D",  color: "bg-sky-100 border-sky-300" },
  { symbol: "9",       name: "Dominant 9th",       nameCN: "属九和弦",       formula: "1 3 5 ♭7 9",  intervals: "0 4 7 10 14", example: "C9",   notes: "C E G B♭ D",  color: "bg-amber-100 border-amber-300" },
  { symbol: "m9",      name: "Minor 9th",          nameCN: "小九和弦",       formula: "1 ♭3 5 ♭7 9", intervals: "0 3 7 10 14", example: "Cm9",  notes: "C E♭ G B♭ D", color: "bg-indigo-100 border-indigo-300" },
  { symbol: "13",      name: "Dominant 13th",      nameCN: "属十三和弦",     formula: "1 3 5 ♭7 9 13", intervals: "0 4 7 10 14 21", example: "C13", notes: "C E G B♭ D A", color: "bg-amber-100 border-amber-300" },
  { symbol: "7sus4",   name: "Dominant 7th sus4",  nameCN: "属七挂四和弦",   formula: "1 4 5 ♭7",    intervals: "0 5 7 10", example: "C7sus4", notes: "C F G B♭",   color: "bg-teal-100 border-teal-300" },
  { symbol: "7♯9",    name: "7 Sharp 9",          nameCN: "升九属七",        formula: "1 3 5 ♭7 ♯9", intervals: "0 4 7 10 15", example: "C7♯9", notes: "C E G B♭ D♯", color: "bg-purple-100 border-purple-300" },
];

// ── 音程 ──────────────────────────────────────────────────────
export interface IntervalEntry {
  semitones: number;
  name: string;
  nameCN: string;
  abbr: string;
  quality: "完全" | "大" | "小" | "增" | "减";
  example: string; // C为根音
  feel: string;
}

export const INTERVALS: IntervalEntry[] = [
  { semitones: 0,  name: "Perfect Unison",   nameCN: "完全一度", abbr: "P1",  quality: "完全", example: "C → C",  feel: "同音" },
  { semitones: 1,  name: "Minor 2nd",        nameCN: "小二度",   abbr: "m2",  quality: "小",   example: "C → D♭", feel: "紧张，半音" },
  { semitones: 2,  name: "Major 2nd",        nameCN: "大二度",   abbr: "M2",  quality: "大",   example: "C → D",  feel: "全音，流动" },
  { semitones: 3,  name: "Minor 3rd",        nameCN: "小三度",   abbr: "m3",  quality: "小",   example: "C → E♭", feel: "小调色彩" },
  { semitones: 4,  name: "Major 3rd",        nameCN: "大三度",   abbr: "M3",  quality: "大",   example: "C → E",  feel: "大调色彩，明亮" },
  { semitones: 5,  name: "Perfect 4th",      nameCN: "完全四度", abbr: "P4",  quality: "完全", example: "C → F",  feel: "空旷，稳定" },
  { semitones: 6,  name: "Tritone",          nameCN: "增四/减五度", abbr: "TT", quality: "增",  example: "C → F♯", feel: "最紧张，魔鬼音程" },
  { semitones: 7,  name: "Perfect 5th",      nameCN: "完全五度", abbr: "P5",  quality: "完全", example: "C → G",  feel: "最稳定，开放" },
  { semitones: 8,  name: "Minor 6th",        nameCN: "小六度",   abbr: "m6",  quality: "小",   example: "C → A♭", feel: "忧郁" },
  { semitones: 9,  name: "Major 6th",        nameCN: "大六度",   abbr: "M6",  quality: "大",   example: "C → A",  feel: "温暖，甜" },
  { semitones: 10, name: "Minor 7th",        nameCN: "小七度",   abbr: "m7",  quality: "小",   example: "C → B♭", feel: "爵士感，未解决" },
  { semitones: 11, name: "Major 7th",        nameCN: "大七度",   abbr: "M7",  quality: "大",   example: "C → B",  feel: "梦幻，浪漫" },
  { semitones: 12, name: "Perfect Octave",   nameCN: "完全八度", abbr: "P8",  quality: "完全", example: "C → C'", feel: "同音高八度" },
];

// ── 调式 ──────────────────────────────────────────────────────
export interface ModeEntry {
  degree: number;
  name: string;
  nameCN: string;
  formula: string;         // 全/半音公式 W=全音 H=半音
  steps: string;           // 音阶各音，以C为例
  intervals: number[];     // 半音数
  chordType: string;       // 该调式的主和弦类型
  mood: string;
  color: string;           // tailwind 渐变 from-xx
  textColor: string;
  borderColor: string;
  bgColor: string;
  example: string;         // 实际应用例子
  tip: string;             // NiceChord 精华提示
}

export const MODES: ModeEntry[] = [
  {
    degree: 1,
    name: "Ionian",
    nameCN: "自然大调",
    formula: "W W H W W W H",
    steps: "C D E F G A B",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    chordType: "maj7",
    mood: "明亮、快乐、开朗",
    color: "from-amber-400 to-yellow-300",
    textColor: "text-amber-900",
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50",
    example: "流行歌曲、儿歌、多数大调歌曲",
    tip: "最基础的调式，降低第3、6、7音就变成自然小调（Aeolian）",
  },
  {
    degree: 2,
    name: "Dorian",
    nameCN: "多利安调式",
    formula: "W H W W W H W",
    steps: "D E F G A B C",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    chordType: "m7",
    mood: "小调但有光明感，爵士律动",
    color: "from-indigo-500 to-blue-400",
    textColor: "text-indigo-900",
    borderColor: "border-indigo-300",
    bgColor: "bg-indigo-50",
    example: "So What（Miles Davis）、Oye Como Va、爵士Blues",
    tip: "相比自然小调，第6音是大六度，听起来比较「光明」。爵士吉他手最爱的小调调式",
  },
  {
    degree: 3,
    name: "Phrygian",
    nameCN: "弗里几亚调式",
    formula: "H W W W H W W",
    steps: "E F G A B C D",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    chordType: "m7",
    mood: "暗、神秘、西班牙风情",
    color: "from-red-500 to-rose-400",
    textColor: "text-red-900",
    borderColor: "border-red-300",
    bgColor: "bg-red-50",
    example: "弗拉门戈吉他、金属乐、西班牙风格",
    tip: "第2音只差半音，这是西班牙感的来源。Phrygian Dominant（升高第3音）更常用于弗拉门戈",
  },
  {
    degree: 4,
    name: "Lydian",
    nameCN: "利底亚调式",
    formula: "W W W H W W H",
    steps: "F G A B C D E",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    chordType: "maj7",
    mood: "梦幻、飘浮、电影感",
    color: "from-emerald-400 to-teal-300",
    textColor: "text-emerald-900",
    borderColor: "border-emerald-300",
    bgColor: "bg-emerald-50",
    example: "电影配乐（约翰·威廉姆斯）、梦幻流行",
    tip: "升高第4音（#4）是最大特色，比大调听起来更「梦幻飘浮」",
  },
  {
    degree: 5,
    name: "Mixolydian",
    nameCN: "混合利底亚调式",
    formula: "W W H W W H W",
    steps: "G A B C D E F",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    chordType: "7",
    mood: "蓝调感、摇滚、放克",
    color: "from-orange-400 to-amber-300",
    textColor: "text-orange-900",
    borderColor: "border-orange-300",
    bgColor: "bg-orange-50",
    example: "Hey Joe、Sweet Home Chicago、蓝调摇滚",
    tip: "大调 + 降第7音，是属七和弦的自然家园。Blues 和 Rock 中大量使用",
  },
  {
    degree: 6,
    name: "Aeolian",
    nameCN: "自然小调",
    formula: "W H W W H W W",
    steps: "A B C D E F G",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    chordType: "m7",
    mood: "悲伤、忧郁、内敛",
    color: "from-slate-500 to-gray-400",
    textColor: "text-slate-900",
    borderColor: "border-slate-300",
    bgColor: "bg-slate-50",
    example: "多数流行悲歌、摇滚慢歌",
    tip: "降低 Ionian 的第3、6、7音即可得到。与 Dorian 的区别：第6音是小六度（更悲）",
  },
  {
    degree: 7,
    name: "Locrian",
    nameCN: "洛克里安调式",
    formula: "H W W H W W W",
    steps: "B C D E F G A",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    chordType: "m7♭5",
    mood: "极度不稳、黑暗、金属",
    color: "from-violet-600 to-purple-500",
    textColor: "text-violet-900",
    borderColor: "border-violet-300",
    bgColor: "bg-violet-50",
    example: "金属乐、实验音乐（实际应用较少）",
    tip: "五度音是减五度而非完全五度，极度不稳定，是所有调式中最黑暗的",
  },
];

// ── 大调内的自然和弦进行 ─────────────────────────────────────
export interface DiatonicChord {
  degree: string;          // "I", "IIm", etc.
  numeral: number;         // 1-7
  name: string;            // e.g. "Cmaj7"
  type: string;            // maj7 / m7 / 7 / m7b5
  function: string;        // 主和弦 / 下属和弦 / 属和弦
  functionColor: string;
  mood: string;
}

export const C_MAJOR_DIATONIC: DiatonicChord[] = [
  { degree: "Ⅰ",   numeral: 1, name: "Cmaj7",  type: "maj7",  function: "主",   functionColor: "bg-sky-100 text-sky-700 border-sky-200",     mood: "家，稳定，解决" },
  { degree: "Ⅱm",  numeral: 2, name: "Dm7",    type: "m7",    function: "下属", functionColor: "bg-green-100 text-green-700 border-green-200", mood: "离家，流动" },
  { degree: "Ⅲm",  numeral: 3, name: "Em7",    type: "m7",    function: "主",   functionColor: "bg-sky-100 text-sky-700 border-sky-200",     mood: "像家，但更温柔" },
  { degree: "Ⅳ",   numeral: 4, name: "Fmaj7",  type: "maj7",  function: "下属", functionColor: "bg-green-100 text-green-700 border-green-200", mood: "跨出一步，明朗" },
  { degree: "Ⅴ",   numeral: 5, name: "G7",     type: "7",     function: "属",   functionColor: "bg-amber-100 text-amber-700 border-amber-200", mood: "强烈想回家" },
  { degree: "Ⅵm",  numeral: 6, name: "Am7",    type: "m7",    function: "主",   functionColor: "bg-sky-100 text-sky-700 border-sky-200",     mood: "相对主，忧郁版" },
  { degree: "Ⅶm♭5",numeral: 7, name: "Bm7♭5", type: "m7♭5", function: "属",   functionColor: "bg-amber-100 text-amber-700 border-amber-200", mood: "最不稳，罕用" },
];

// ── 常用和弦进行 ─────────────────────────────────────────────
export interface ProgressionEntry {
  id: string;
  name: string;
  nameCN: string;
  degrees: string[];
  inC: string[];
  style: string;
  description: string;
  tags: string[];
}

export const PROGRESSIONS: ProgressionEntry[] = [
  {
    id: "1625",
    name: "1-6-2-5",
    nameCN: "一六二五",
    degrees: ["Ⅰmaj7", "Ⅵm7", "Ⅱm7", "Ⅴ7"],
    inC: ["Cmaj7", "Am7", "Dm7", "G7"],
    style: "流行 / 爵士",
    description: "最经典的循环进行，几乎能套用任何旋律。NiceChord 强调这是\"厉害的人都在用\"的万能进行。",
    tags: ["流行", "爵士", "万能"],
  },
  {
    id: "1451",
    name: "1-4-5-1",
    nameCN: "一四五一",
    degrees: ["Ⅰ", "Ⅳ", "Ⅴ", "Ⅰ"],
    inC: ["C", "F", "G7", "C"],
    style: "流行 / 摇滚 / 蓝调",
    description: "最基础的三和弦进行，主-下属-属-主，完整功能解决。",
    tags: ["流行", "摇滚", "基础"],
  },
  {
    id: "251",
    name: "2-5-1",
    nameCN: "二五一",
    degrees: ["Ⅱm7", "Ⅴ7", "Ⅰmaj7"],
    inC: ["Dm7", "G7", "Cmaj7"],
    style: "爵士",
    description: "爵士乐的核心进行。Ⅱm7 → Ⅴ7 有极强的张力，解决到 Ⅰmaj7 极满足。",
    tags: ["爵士", "核心"],
  },
  {
    id: "1564",
    name: "1-5-6-4",
    nameCN: "一五六四",
    degrees: ["Ⅰ", "Ⅴ", "Ⅵm", "Ⅳ"],
    inC: ["C", "G", "Am", "F"],
    style: "流行",
    description: "21世纪最流行的进行之一，大量出现在 Pop 歌曲中。",
    tags: ["流行", "现代"],
  },
  {
    id: "6251",
    name: "6-2-5-1",
    nameCN: "六二五一",
    degrees: ["Ⅵm7", "Ⅱm7", "Ⅴ7", "Ⅰmaj7"],
    inC: ["Am7", "Dm7", "G7", "Cmaj7"],
    style: "流行 / 爵士",
    description: "1625 的变体，从Ⅵm开始，带来更多情绪起伏。华语流行极常见。",
    tags: ["流行", "爵士", "华语"],
  },
  {
    id: "1625_minor",
    name: "1-6-2-5（小调）",
    nameCN: "小调版一六二五",
    degrees: ["Ⅰm7", "Ⅵ♭maj7", "Ⅱm7♭5", "Ⅴ7"],
    inC: ["Cm7", "A♭maj7", "Dm7♭5", "G7"],
    style: "爵士 / 小调流行",
    description: "小调版本，带有更多忧郁和戏剧感。",
    tags: ["小调", "爵士"],
  },
  {
    id: "12bar",
    name: "12-Bar Blues",
    nameCN: "十二小节蓝调",
    degrees: ["Ⅰ7 ×4", "Ⅳ7 ×2", "Ⅰ7 ×2", "Ⅴ7", "Ⅳ7", "Ⅰ7", "Ⅴ7"],
    inC: ["C7 ×4", "F7 ×2", "C7 ×2", "G7", "F7", "C7", "G7"],
    style: "蓝调 / 摇滚",
    description: "蓝调的标准结构。全部使用属七和弦，12小节为一个循环。",
    tags: ["蓝调", "摇滚", "经典结构"],
  },
  {
    id: "dorian",
    name: "Dorian Vamp",
    nameCN: "多利安律动",
    degrees: ["Ⅰm7", "Ⅳ7"],
    inC: ["Cm7", "F7"],
    style: "爵士 / 放克 / Neo Soul",
    description: "在同一个小调上反复摇摆，利用 Dorian 的大六度制造特有的光明感。",
    tags: ["爵士", "放克", "Dorian"],
  },
];

// ── 五度圈 ───────────────────────────────────────────────────
export interface FifthsEntry {
  position: number;        // 0-11，顺时针
  major: string;
  minor: string;
  sharps: number;          // 正数=升号数，负数=降号数
  flats: number;
  angle: number;           // 圆上角度（degree，0=C在顶部）
}

export const CIRCLE_OF_FIFTHS: FifthsEntry[] = [
  { position: 0,  major: "C",  minor: "Am",  sharps: 0,  flats: 0,  angle: 0 },
  { position: 1,  major: "G",  minor: "Em",  sharps: 1,  flats: 0,  angle: 30 },
  { position: 2,  major: "D",  minor: "Bm",  sharps: 2,  flats: 0,  angle: 60 },
  { position: 3,  major: "A",  minor: "F♯m", sharps: 3,  flats: 0,  angle: 90 },
  { position: 4,  major: "E",  minor: "C♯m", sharps: 4,  flats: 0,  angle: 120 },
  { position: 5,  major: "B",  minor: "G♯m", sharps: 5,  flats: 0,  angle: 150 },
  { position: 6,  major: "F♯/G♭", minor: "D♯m/E♭m", sharps: 6, flats: 6, angle: 180 },
  { position: 7,  major: "D♭", minor: "B♭m", sharps: 0,  flats: 5,  angle: 210 },
  { position: 8,  major: "A♭", minor: "Fm",  sharps: 0,  flats: 4,  angle: 240 },
  { position: 9,  major: "E♭", minor: "Cm",  sharps: 0,  flats: 3,  angle: 270 },
  { position: 10, major: "B♭", minor: "Gm",  sharps: 0,  flats: 2,  angle: 300 },
  { position: 11, major: "F",  minor: "Dm",  sharps: 0,  flats: 1,  angle: 330 },
];

// ── 副属和弦（Secondary Dominants） ─────────────────────────
export interface SecondaryDominantEntry {
  target: string;          // 目标和弦，如 "Ⅱm"
  chord: string;           // 副属和弦，如 "A7"
  chordDegree: string;     // "Ⅴ7/Ⅱ"
  inC: string;
  description: string;
}

export const SECONDARY_DOMINANTS: SecondaryDominantEntry[] = [
  { target: "Ⅱm7",  chordDegree: "Ⅴ7/Ⅱ",  chord: "A7",   inC: "A7 → Dm7",  description: "A7 解决到 Dm7，A7 是 Dm 的属七和弦" },
  { target: "Ⅲm7",  chordDegree: "Ⅴ7/Ⅲ",  chord: "B7",   inC: "B7 → Em7",  description: "B7 解决到 Em7" },
  { target: "Ⅳmaj7", chordDegree: "Ⅴ7/Ⅳ", chord: "C7",   inC: "C7 → Fmaj7", description: "C7 解决到 Fmaj7（最常用）" },
  { target: "Ⅴ7",   chordDegree: "Ⅴ7/Ⅴ",  chord: "D7",   inC: "D7 → G7",   description: "D7 解决到 G7" },
  { target: "Ⅵm7",  chordDegree: "Ⅴ7/Ⅵ",  chord: "E7",   inC: "E7 → Am7",  description: "E7 解决到 Am7（极常用，给歌曲增添戏剧感）" },
];

// ── 借用和弦（Borrowed Chords） ──────────────────────────────
export interface BorrowedChordEntry {
  chord: string;
  from: string;
  inC: string;
  degree: string;
  usage: string;
  example: string;
}

export const BORROWED_CHORDS: BorrowedChordEntry[] = [
  { chord: "♭VII", from: "自然小调",     inC: "B♭maj7", degree: "♭Ⅶmaj7", usage: "接在 Ⅳ 或 Ⅰ 前，增加大调歌曲的小调色彩", example: "F → B♭ → C" },
  { chord: "♭VI",  from: "自然小调",     inC: "A♭maj7", degree: "♭Ⅵmaj7", usage: "常见于流行副歌，戏剧感强烈的借用",          example: "C → A♭ → B♭ → C" },
  { chord: "♭III", from: "自然小调",     inC: "E♭maj7", degree: "♭Ⅲmaj7", usage: "接在 Ⅰ 或 Ⅱm 之前，给大调增添阴暗感",   example: "C → E♭ → F" },
  { chord: "Ⅳm",  from: "自然小调",     inC: "Fm7",    degree: "Ⅳm7",     usage: "替换 Ⅳmaj7，忧郁感加倍，和声小调感觉",   example: "C → Fm → C" },
  { chord: "♭II",  from: "那不勒斯和弦", inC: "D♭maj7", degree: "♭Ⅱmaj7", usage: "取代 Ⅱm 作为下属功能，浪漫、古典感",       example: "D♭maj7 → G7 → C" },
];
