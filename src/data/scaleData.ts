export const DISPLAY_NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const ROOT_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard tuning: string index 0 = low E (string 6), index 5 = high e (string 1)
// For display top-to-bottom (high e → low E), we use DISPLAY_STRINGS
export const DISPLAY_STRINGS = [4, 11, 7, 2, 9, 4]; // e B G D A E semitones
export const DISPLAY_STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

export interface ScaleType {
  id: string;
  name: string;
  nameEn: string;
  intervals: number[]; // semitones from root
  degrees: string[];   // degree name for each interval
  formula: string;
  category: string;
  description: string;
}

export const SCALE_CATEGORIES = [
  { id: 'major', label: '大调' },
  { id: 'minor', label: '小调' },
  { id: 'pentatonic', label: '五声/布鲁斯' },
  { id: 'modes', label: '调式' },
];

export const SCALES: ScaleType[] = [
  {
    id: 'major',
    name: '自然大调',
    nameEn: 'Major Scale',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    formula: 'W W H W W W H',
    category: 'major',
    description: '最基础的音阶，所有调式的参照系。C大调：C D E F G A B。先从C大调开始，熟悉每个音在指板上的位置。',
  },
  {
    id: 'naturalMinor',
    name: '自然小调',
    nameEn: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    formula: 'W H W W H W W',
    category: 'minor',
    description: '大调的关系小调，与大调共享相同音符但根音不同。A自然小调与C大调完全相同，更忧郁的色彩。',
  },
  {
    id: 'harmonicMinor',
    name: '和声小调',
    nameEn: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '7'],
    formula: 'W H W W H A2 H',
    category: 'minor',
    description: '升高7音产生导音效果，增强和声功能感。♭6到7的增二度带来独特的异域感（东欧、中东风格）。',
  },
  {
    id: 'melodicMinor',
    name: '旋律小调',
    nameEn: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ['1', '2', '♭3', '4', '5', '6', '7'],
    formula: 'W H W W W W H',
    category: 'minor',
    description: '同时升高6、7音使旋律更流畅。爵士乐中广泛使用，也称"爵士小调"。',
  },
  {
    id: 'majorPentatonic',
    name: '大调五声',
    nameEn: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    formula: 'W W m3 W m3',
    category: 'pentatonic',
    description: '大调去掉4和7，几乎在任何大调和弦上都好听，几乎不会出错。民谣、乡村、流行中大量使用。',
  },
  {
    id: 'minorPentatonic',
    name: '小调五声',
    nameEn: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', '♭3', '4', '5', '♭7'],
    formula: 'm3 W W m3 W',
    category: 'pentatonic',
    description: '摇滚吉他手的基础音阶。5个把位（Box 1–5）覆盖整个指板，是 CAGED 体系的直接应用。',
  },
  {
    id: 'blues',
    name: '布鲁斯音阶',
    nameEn: 'Blues Scale',
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', '♭3', '4', '♭5', '5', '♭7'],
    formula: 'm3 W H H m3',
    category: 'pentatonic',
    description: '小调五声加♭5（蓝调音）。♭5制造张力与解决，是布鲁斯和摇滚即兴的灵魂。',
  },
  {
    id: 'dorian',
    name: '多利亚',
    nameEn: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', '♭3', '4', '5', '6', '♭7'],
    formula: 'W H W W W H W',
    category: 'modes',
    description: '小调但有大六度，比自然小调更明亮。Santana、Pink Floyd的标志性音阶，常用于 ii 和弦上。',
  },
  {
    id: 'phrygian',
    name: '弗里几亚',
    nameEn: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
    formula: 'H W W W H W W',
    category: 'modes',
    description: '从♭2开始的小调，有强烈的西班牙/弗拉门戈风格。金属音乐常用，用于 iii 和弦上。',
  },
  {
    id: 'lydian',
    name: '利底亚',
    nameEn: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ['1', '2', '3', '♯4', '5', '6', '7'],
    formula: 'W W W H W W H',
    category: 'modes',
    description: '大调升高4音，产生梦幻漂浮的感觉。Joe Satriani、电影配乐常用，用于 IV 和弦上。',
  },
  {
    id: 'mixolydian',
    name: '混合利底亚',
    nameEn: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', '♭7'],
    formula: 'W W H W W H W',
    category: 'modes',
    description: '大调降低7音，带有蓝调感。用于属和弦（V7），是摇滚、布鲁斯即兴的核心音阶。',
  },
  {
    id: 'locrian',
    name: '洛克里亚',
    nameEn: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
    formula: 'H W W H W W W',
    category: 'modes',
    description: '最暗的调式，含♭5。用于半减七和弦（vii°），爵士和金属中使用，用于 vii 和弦上。',
  },
];

// Color by interval semitones
export function getIntervalColor(semitones: number): string {
  if (semitones === 0) return '#4f46e5';              // root — indigo
  if (semitones === 7) return '#2563eb';              // P5 — blue
  if (semitones === 4 || semitones === 3) return '#16a34a'; // M3 / m3 — green
  if (semitones === 11 || semitones === 10) return '#d97706'; // M7 / m7 — amber
  if (semitones === 6) return '#dc2626';              // ♭5 (blues note) — red
  return '#78716c';                                   // other — stone
}
