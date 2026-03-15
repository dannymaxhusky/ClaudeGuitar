export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface PathModule {
  id: number;
  chapter: string;
  title: string;
  titleEn: string;
  description: string;
  objectives: string[];
  tools: { label: string; href: string; color: string }[];
  difficulty: Difficulty;
  tags: string[];
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: "#22c55e",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export const LEARNING_PATH: PathModule[] = [
  {
    id: 1,
    chapter: "第1章",
    title: "吉他基础认知",
    titleEn: "Guitar Fundamentals",
    description: "了解吉他构造、标准调音（EADGBE）、正确持琴与右手拨弦姿势。这是所有技巧的地基。",
    objectives: ["记住6根弦的名称和顺序", "学会用调音器调至标准音", "能稳定地用手指或拨片拨出干净的音"],
    tools: [],
    difficulty: "beginner",
    tags: ["基础", "调音", "姿势"],
  },
  {
    id: 2,
    chapter: "第2章",
    title: "开放和弦",
    titleEn: "Open Chords",
    description: "掌握 C、A、G、E、D 五个开放和弦指型 —— 它们是 CAGED 系统的核心，也是所有和弦的起点。",
    objectives: ["能流畅按出并换用 C A G E D 五个和弦", "理解每个和弦的根音位置", "能演奏简单的 I-IV-V 进行"],
    tools: [
      { label: "🎸 CAGED 系统", href: "/caged", color: "#4f46e5" },
      { label: "📖 和弦符号", href: "/theory#chord-symbols", color: "#0ea5e9" },
    ],
    difficulty: "beginner",
    tags: ["开放和弦", "CAGED", "基础"],
  },
  {
    id: 3,
    chapter: "第3章",
    title: "节奏与律动",
    titleEn: "Rhythm & Groove",
    description: "节奏是吉他演奏的灵魂。学习基本扫弦模式、切分节奏和用节拍器建立稳定律动感。",
    objectives: ["掌握 4/4 拍基本扫弦型（下↓↑↓↑）", "能在 80 BPM 下稳定演奏", "理解切分节奏"],
    tools: [
      { label: "🎵 伴奏练习", href: "/backing", color: "#10b981" },
    ],
    difficulty: "beginner",
    tags: ["节奏", "扫弦", "律动"],
  },
  {
    id: 4,
    chapter: "第4章",
    title: "调性与和弦功能",
    titleEn: "Tonality & Chord Function",
    description: "理解为什么某些和弦放在一起好听。学习 I-IV-V 功能、1625 进行以及自然大调的级数和弦。",
    objectives: ["理解 I(主)、IV(下属)、V(属) 三大功能", "能在任意调演奏 1-6-4-5 和 2-5-1", "听出和声的紧张与解决"],
    tools: [
      { label: "📖 和弦进行", href: "/theory#progressions", color: "#0ea5e9" },
      { label: "📖 自然大调和弦", href: "/theory#diatonic", color: "#0ea5e9" },
    ],
    difficulty: "beginner",
    tags: ["和弦功能", "调性", "进行"],
  },
  {
    id: 5,
    chapter: "第5章",
    title: "CAGED 系统",
    titleEn: "CAGED System",
    description: "把第2章的5个开放和弦移位到整个指板，彻底打通指板认知。每种和弦在12品内有5个位置。",
    objectives: ["能在任意根音找到5种 CAGED 指型", "理解相邻指型的重叠关系", "在 G 调演奏完整的 CAGED 连接"],
    tools: [
      { label: "🎸 CAGED 系统", href: "/caged", color: "#4f46e5" },
    ],
    difficulty: "intermediate",
    tags: ["CAGED", "指板", "移调"],
  },
  {
    id: 6,
    chapter: "第6章",
    title: "自然大调音阶",
    titleEn: "Major Scale",
    description: "在指板上系统掌握大调音阶。从单弦练习到跨弦连接，建立音阶在指板上的空间感。",
    objectives: ["能在全颈演奏 C 大调音阶", "用节拍器从 60 BPM 练到 120 BPM", "找出音阶与 CAGED 指型的对应关系"],
    tools: [
      { label: "🎵 音阶练习器", href: "/scales", color: "#8b5cf6" },
      { label: "📖 调式", href: "/theory#modes", color: "#0ea5e9" },
    ],
    difficulty: "intermediate",
    tags: ["大调", "音阶", "指板"],
  },
  {
    id: 7,
    chapter: "第7章",
    title: "五声音阶与蓝调",
    titleEn: "Pentatonic & Blues",
    description: "摇滚、蓝调即兴的基础。掌握小调五声的5个把位，并加入♭5蓝调音，开始即兴演奏。",
    objectives: ["记住小调五声5个 Box 把位", "能在 Am 五声上即兴8小节", "在布鲁斯音阶中运用♭5制造张力"],
    tools: [
      { label: "🎵 小调五声", href: "/scales", color: "#8b5cf6" },
      { label: "🎵 布鲁斯音阶", href: "/scales", color: "#8b5cf6" },
      { label: "🎵 12小节蓝调伴奏", href: "/backing", color: "#10b981" },
    ],
    difficulty: "intermediate",
    tags: ["五声", "蓝调", "即兴"],
  },
  {
    id: 8,
    chapter: "第8章",
    title: "实用调式：Dorian & Mixolydian",
    titleEn: "Practical Modes",
    description: "从实用角度学调式。Dorian 用于 ii 小调和弦，Mixolydian 用于属和弦（V7）—— 这两个调式占据了大量摇滚/爵士即兴场景。",
    objectives: ["理解调式与大调的关系（大调第几个音开始）", "能在 Dm7 上用 D Dorian 即兴", "能在 G7 上用 G Mixolydian 即兴"],
    tools: [
      { label: "🎵 Dorian", href: "/scales", color: "#8b5cf6" },
      { label: "🎵 Mixolydian", href: "/scales", color: "#8b5cf6" },
      { label: "📖 调式", href: "/theory#modes", color: "#0ea5e9" },
    ],
    difficulty: "intermediate",
    tags: ["调式", "Dorian", "Mixolydian"],
  },
  {
    id: 9,
    chapter: "第9章",
    title: "即兴演奏入门",
    titleEn: "Intro to Improvisation",
    description: "把音阶变成音乐。学习如何在和弦上选音、使用目标音、控制乐句的起伏和呼吸感。",
    objectives: ["能聚焦骨干音（根音、三度、五度）演奏乐句", "理解「问答句」结构", "能即兴演奏2分钟不间断"],
    tools: [
      { label: "🎵 音阶练习器", href: "/scales", color: "#8b5cf6" },
      { label: "🎵 伴奏练习", href: "/backing", color: "#10b981" },
    ],
    difficulty: "intermediate",
    tags: ["即兴", "乐句", "目标音"],
  },
  {
    id: 10,
    chapter: "第10章",
    title: "七和弦与爵士色彩",
    titleEn: "Seventh Chords & Jazz Colors",
    description: "在基础三和弦上加7音，大幅丰富和声色彩。掌握 maj7、m7、dom7、m7♭5 四种核心七和弦。",
    objectives: ["能弹出 Cmaj7、Am7、G7、Bm7♭5 的多种指型", "理解7音对和弦功能的影响", "用七和弦改编一首已知歌曲"],
    tools: [
      { label: "📖 和弦符号", href: "/theory#chord-symbols", color: "#0ea5e9" },
      { label: "🎸 七和弦 CAGED", href: "/caged", color: "#4f46e5" },
    ],
    difficulty: "intermediate",
    tags: ["七和弦", "爵士", "色彩"],
  },
  {
    id: 11,
    chapter: "第11章",
    title: "二五一进行",
    titleEn: "ii-V-I Progression",
    description: "爵士和声的核心进行，也是理解调内和弦功能的最好模型。掌握在各调的 ii-V-I 以及对应的音阶选择。",
    objectives: ["在 C 调演奏 Dm7-G7-Cmaj7", "用 Dorian → Mixolydian → Ionian 跟随和弦即兴", "能在5个常见调上演奏 ii-V-I"],
    tools: [
      { label: "📖 二五一", href: "/theory#progressions", color: "#0ea5e9" },
      { label: "🎵 伴奏练习", href: "/backing", color: "#10b981" },
    ],
    difficulty: "advanced",
    tags: ["251", "爵士", "和声"],
  },
  {
    id: 12,
    chapter: "第12章",
    title: "借用和弦与调色板扩展",
    titleEn: "Borrowed Chords",
    description: "从平行调（同根大小调）借用和弦，打破调性束缚，创造更戏剧性的和声色彩。",
    objectives: ["理解平行大小调借用的概念", "在大调进行中自然地插入 ♭VII 和 ♭III", "辨听借用和弦带来的色彩变化"],
    tools: [
      { label: "📖 借用和弦", href: "/theory#borrowed", color: "#0ea5e9" },
      { label: "📖 副属和弦", href: "/theory#secondary", color: "#0ea5e9" },
    ],
    difficulty: "advanced",
    tags: ["借用和弦", "调式混合", "色彩"],
  },
  {
    id: 13,
    chapter: "第13章",
    title: "编曲思维",
    titleEn: "Arranging Mindset",
    description: "把所学的一切运用到编曲中。如何给一首歌配上吉他，如何用不同音区、织体和节奏型创造层次感。",
    objectives: ["能为一首歌写出前奏、主歌、副歌的吉他编排", "理解节奏吉他与 Lead 吉他的分工", "运用第2-12章的所有工具"],
    tools: [
      { label: "🎸 CAGED", href: "/caged", color: "#4f46e5" },
      { label: "🎵 音阶", href: "/scales", color: "#8b5cf6" },
      { label: "📖 乐理知识库", href: "/theory", color: "#0ea5e9" },
    ],
    difficulty: "advanced",
    tags: ["编曲", "综合", "实践"],
  },
  {
    id: 14,
    chapter: "第14章",
    title: "综合实践与个人风格",
    titleEn: "Comprehensive Practice",
    description: "用前13章的所有知识演奏完整曲目，并开始探索个人演奏风格。真正的学习在于持续演奏和听音乐。",
    objectives: ["完整演奏一首3分钟以上的曲目", "能识别并分析喜欢的吉他手的和声/音阶选择", "建立每日练习计划并坚持执行"],
    tools: [
      { label: "🎸 CAGED", href: "/caged", color: "#4f46e5" },
      { label: "🎵 音阶练习器", href: "/scales", color: "#8b5cf6" },
      { label: "🎵 伴奏练习", href: "/backing", color: "#10b981" },
      { label: "📖 乐理知识库", href: "/theory", color: "#0ea5e9" },
    ],
    difficulty: "advanced",
    tags: ["综合", "风格", "实践"],
  },
];
