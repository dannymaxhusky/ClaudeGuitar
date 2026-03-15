"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import {
  CHORD_SYMBOLS,
  INTERVALS,
  MODES,
  C_MAJOR_DIATONIC,
  PROGRESSIONS,
  CIRCLE_OF_FIFTHS,
  SECONDARY_DOMINANTS,
  BORROWED_CHORDS,
} from "@/data/theoryData";

// ── 侧边导航 ─────────────────────────────────────────────────
const SECTIONS = [
  { id: "quiz",         icon: "🎮", label: "互动练习" },
  { id: "chords",       icon: "🎯", label: "和弦代号" },
  { id: "intervals",    icon: "📏", label: "音程" },
  { id: "modes",        icon: "🌈", label: "七种调式" },
  { id: "diatonic",     icon: "🏠", label: "大调自然和弦" },
  { id: "progressions", icon: "🔄", label: "常用进行" },
  { id: "fifths",       icon: "⭕", label: "五度圈" },
  { id: "secondary",    icon: "➕", label: "副属和弦" },
  { id: "borrowed",     icon: "🎭", label: "借用和弦" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

// ── 小徽章 ────────────────────────────────────────────────────
function Tag({ children, color = "bg-[#F0EDE8] text-[#57534E]" }: { children: string; color?: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

// ── 互动练习 ──────────────────────────────────────────────────
type QuizTopic = "chords" | "intervals" | "modes";

interface QuizQ {
  q: string;
  answer: string;
  options: string[];
  explanation: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickWrong<T>(pool: T[], correct: T, count: number): T[] {
  return shuffle(pool.filter((x) => x !== correct)).slice(0, count);
}

function generateChordQs(): QuizQ[] {
  const qs: QuizQ[] = [];
  for (const e of shuffle(CHORD_SYMBOLS).slice(0, 5)) {
    const opts = shuffle([e.nameCN, ...pickWrong(CHORD_SYMBOLS.map((c) => c.nameCN), e.nameCN, 3)]);
    qs.push({ q: `C${e.symbol || "（无后缀）"} 是什么和弦？`, answer: e.nameCN, options: opts, explanation: `C${e.symbol} = ${e.nameCN}，公式：${e.formula}，组成音：${e.notes}` });
  }
  for (const e of shuffle(CHORD_SYMBOLS).slice(0, 5)) {
    const opts = shuffle([e.nameCN, ...pickWrong(CHORD_SYMBOLS.map((c) => c.nameCN), e.nameCN, 3)]);
    qs.push({ q: `公式 "${e.formula}" 是哪种和弦？`, answer: e.nameCN, options: opts, explanation: `${e.nameCN}（${e.name}）公式 ${e.formula}，例：${e.example}（${e.notes}）` });
  }
  return shuffle(qs).slice(0, 10);
}

function generateIntervalQs(): QuizQ[] {
  const qs: QuizQ[] = [];
  for (const iv of shuffle(INTERVALS).slice(0, 7)) {
    const opts = shuffle([iv.nameCN, ...pickWrong(INTERVALS.map((i) => i.nameCN), iv.nameCN, 3)]);
    qs.push({ q: `${iv.semitones} 个半音 = 什么音程？`, answer: iv.nameCN, options: opts, explanation: `${iv.nameCN}（${iv.abbr}）= ${iv.semitones} 半音，${iv.example}，${iv.feel}` });
  }
  for (const iv of shuffle(INTERVALS).slice(0, 3)) {
    const opts = shuffle([iv.nameCN, ...pickWrong(INTERVALS.map((i) => i.nameCN), iv.nameCN, 3)]);
    qs.push({ q: `"${iv.feel}" 是哪个音程的特征？`, answer: iv.nameCN, options: opts, explanation: `${iv.nameCN}（${iv.abbr}）的音色：${iv.feel}，例：${iv.example}` });
  }
  return shuffle(qs).slice(0, 10);
}

function generateModeQs(): QuizQ[] {
  const qs: QuizQ[] = [];
  for (const m of shuffle(MODES).slice(0, 4)) {
    const opts = shuffle([m.name, ...pickWrong(MODES.map((x) => x.name), m.name, 3)]);
    qs.push({ q: `第 ${m.degree} 号调式叫什么？`, answer: m.name, options: opts, explanation: `第${m.degree}号调式 ${m.name}（${m.nameCN}），主和弦：${m.chordType}，${m.mood}` });
  }
  for (const m of shuffle(MODES).slice(0, 3)) {
    const opts = shuffle([m.chordType, ...pickWrong(MODES.map((x) => x.chordType), m.chordType, 3)]);
    qs.push({ q: `${m.name} 调式的主和弦类型是？`, answer: m.chordType, options: opts, explanation: `${m.name}（${m.nameCN}）主和弦 ${m.chordType}，${m.mood}` });
  }
  for (const m of shuffle(MODES).slice(0, 3)) {
    const opts = shuffle([m.nameCN, ...pickWrong(MODES.map((x) => x.nameCN), m.nameCN, 3)]);
    qs.push({ q: `"${m.mood}" 描述的是哪个调式？`, answer: m.nameCN, options: opts, explanation: `${m.name} = ${m.nameCN}，${m.mood}，常见于：${m.example}` });
  }
  return shuffle(qs).slice(0, 10);
}

const TOPIC_META: Record<QuizTopic, { label: string; icon: string; color: string; bg: string; generate: () => QuizQ[] }> = {
  chords:    { label: "和弦代号", icon: "🎯", color: "text-sky-600",    bg: "bg-sky-50 border-sky-200",    generate: generateChordQs },
  intervals: { label: "音程",     icon: "📏", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", generate: generateIntervalQs },
  modes:     { label: "七种调式", icon: "🌈", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",  generate: generateModeQs },
};

function QuizSection() {
  const [topic, setTopic] = useState<QuizTopic | null>(null);
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wrongs, setWrongs] = useState<QuizQ[]>([]);
  const [done, setDone] = useState(false);
  const [showWrongs, setShowWrongs] = useState(false);

  const start = (t: QuizTopic) => {
    setTopic(t);
    setQuestions(TOPIC_META[t].generate());
    setIdx(0); setSelected(null); setScore(0);
    setStreak(0); setMaxStreak(0); setWrongs([]); setDone(false); setShowWrongs(false);
  };

  const pick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const q = questions[idx];
    if (opt === q.answer) {
      setScore((s) => s + 1);
      setStreak((s) => { const n = s + 1; setMaxStreak((m) => Math.max(m, n)); return n; });
    } else {
      setStreak(0);
      setWrongs((w) => [...w, q]);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); }
    else { setIdx((i) => i + 1); setSelected(null); }
  };

  const q = questions[idx];
  const meta = topic ? TOPIC_META[topic] : null;

  // ── 主题选择 ──
  if (!topic) return (
    <section id="quiz" className="mb-2">
      <SectionHeader icon="🎮" title="互动练习" subtitle="选择一个主题，用测验巩固记忆——每题都有详解" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.entries(TOPIC_META) as [QuizTopic, typeof TOPIC_META[QuizTopic]][]).map(([key, m]) => (
          <button key={key} onClick={() => start(key)}
            className="group rounded-2xl border-2 border-[#E5DFD6] bg-white hover:border-[#F97316]/60 hover:shadow-md transition-all p-6 text-left">
            <div className="text-4xl mb-3">{m.icon}</div>
            <h3 className={`font-bold text-lg mb-1 font-[family-name:var(--font-space-grotesk)] ${m.color}`}>{m.label}</h3>
            <p className="text-sm text-[#78716C]">10 题 · 多选一 · 含详解</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity">
              开始练习 →
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-[#78716C] mt-4 text-center">每次练习题目随机生成，练完可再刷一遍</p>
    </section>
  );

  // ── 结束页 ──
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? { label: "满分！", emoji: "🏆", color: "text-amber-600" }
      : pct >= 70 ? { label: "不错！", emoji: "🎸", color: "text-sky-600" }
      : { label: "继续加油", emoji: "💪", color: "text-[#57534E]" };
    return (
      <section id="quiz">
        <SectionHeader icon="🎮" title="互动练习" subtitle="选择一个主题，用测验巩固记忆——每题都有详解" />
        <div className="bg-white rounded-2xl border border-[#E5DFD6] p-8 text-center">
          <div className="text-5xl mb-3">{grade.emoji}</div>
          <p className={`text-2xl font-bold mb-1 font-[family-name:var(--font-space-grotesk)] ${grade.color}`}>{grade.label}</p>
          <p className="text-4xl font-bold text-[#1C1917] my-2">{score} / {questions.length}</p>
          <p className="text-[#78716C] mb-2">正确率 {pct}%　·　最高连击 {maxStreak} 🔥</p>

          {wrongs.length > 0 && (
            <div className="mt-6 text-left">
              <button onClick={() => setShowWrongs(!showWrongs)}
                className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium text-sm">
                <span>📝 错题回顾（{wrongs.length} 题）</span>
                <span>{showWrongs ? "▲" : "▼"}</span>
              </button>
              {showWrongs && (
                <div className="mt-2 space-y-3">
                  {wrongs.map((wq, i) => (
                    <div key={i} className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                      <p className="text-sm font-medium text-[#1C1917] mb-1">❓ {wq.q}</p>
                      <p className="text-sm text-emerald-700 font-semibold mb-1">✅ {wq.answer}</p>
                      <p className="text-xs text-[#78716C]">{wq.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6 justify-center flex-wrap">
            <button onClick={() => start(topic!)}
              className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#EA6B0A] transition-colors">
              再来一遍 🔄
            </button>
            <button onClick={() => setTopic(null)}
              className="px-6 py-2.5 bg-white border border-[#E5DFD6] text-[#57534E] rounded-xl font-semibold hover:border-[#C8C2BA] transition-colors">
              换个主题
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── 答题 ──
  const isCorrect = selected === q.answer;
  const progress = ((idx) / questions.length) * 100;

  return (
    <section id="quiz">
      <SectionHeader icon="🎮" title="互动练习" subtitle="选择一个主题，用测验巩固记忆——每题都有详解" />
      <div className="bg-white rounded-2xl border border-[#E5DFD6] overflow-hidden">
        {/* 顶部状态栏 */}
        <div className="px-5 py-3 bg-[#F0EDE8] border-b border-[#E5DFD6] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`font-bold text-sm ${meta!.color}`}>{meta!.icon} {meta!.label}</span>
            <span className="text-xs text-[#78716C]">{idx + 1} / {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            {streak >= 2 && <span className="text-sm font-bold text-orange-500">🔥 {streak} 连击</span>}
            <span className="text-sm font-semibold text-[#1C1917]">✅ {score}</span>
            <button onClick={() => setTopic(null)} className="text-xs text-[#78716C] hover:text-[#57534E]">退出</button>
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-1 bg-[#E5DFD6]">
          <div className="h-1 bg-[#F97316] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6">
          {/* 题目 */}
          <p className="text-lg font-semibold text-[#1C1917] mb-6 leading-snug font-[family-name:var(--font-space-grotesk)]">{q.q}</p>

          {/* 选项 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {q.options.map((opt) => {
              const isThis = selected === opt;
              const correct = opt === q.answer;
              let cls = "border-2 border-[#E5DFD6] bg-white text-[#1C1917] hover:border-[#F97316]/60";
              if (selected) {
                if (correct) cls = "border-2 border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold";
                else if (isThis) cls = "border-2 border-rose-400 bg-rose-50 text-rose-700 line-through";
                else cls = "border-2 border-[#E5DFD6] bg-white text-[#78716C] opacity-50";
              }
              return (
                <button key={opt} onClick={() => pick(opt)} disabled={!!selected}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${cls}`}>
                  {correct && selected ? "✅ " : isThis && selected ? "❌ " : ""}{opt}
                </button>
              );
            })}
          </div>

          {/* 详解 */}
          {selected && (
            <div className={`rounded-xl p-4 mb-5 border text-sm ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
              <p className="font-semibold mb-1">{isCorrect ? "🎉 答对了！" : "💡 解析"}</p>
              <p className="text-[#57534E]">{q.explanation}</p>
            </div>
          )}

          {selected && (
            <button onClick={next}
              className="w-full py-3 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#EA6B0A] transition-colors">
              {idx + 1 >= questions.length ? "查看结果 🏁" : "下一题 →"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ── 和弦代号区 ────────────────────────────────────────────────
function ChordSymbolsSection() {
  const [filter, setFilter] = useState<"all" | "triad" | "seventh" | "extended">("all");

  const groups = {
    all: CHORD_SYMBOLS,
    triad: CHORD_SYMBOLS.slice(0, 6),
    seventh: CHORD_SYMBOLS.slice(6, 13),
    extended: CHORD_SYMBOLS.slice(13),
  };

  const filtered = groups[filter];

  return (
    <section id="chords">
      <SectionHeader icon="🎯" title="和弦代号速查" subtitle="基于 NiceChord 第1章：一次搞懂所有的现代和弦代号" />

      <div className="flex gap-2 mb-5 flex-wrap">
        {([["all", "全部"], ["triad", "三和弦"], ["seventh", "七和弦"], ["extended", "延伸音"]] as const).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-[#F97316] text-white"
                  : "bg-white border border-[#E5DFD6] text-[#57534E] hover:border-[#F97316]/40"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5DFD6] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F0EDE8] border-b border-[#E5DFD6]">
              <th className="text-left px-4 py-3 font-semibold text-[#57534E]">代号</th>
              <th className="text-left px-4 py-3 font-semibold text-[#57534E]">中文名</th>
              <th className="text-left px-4 py-3 font-semibold text-[#57534E] hidden sm:table-cell">英文名</th>
              <th className="text-left px-4 py-3 font-semibold text-[#57534E]">公式</th>
              <th className="text-left px-4 py-3 font-semibold text-[#57534E]">例（C根音）</th>
              <th className="text-left px-4 py-3 font-semibold text-[#57534E] hidden md:table-cell">组成音</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => (
              <tr
                key={entry.symbol + i}
                className={`border-b border-[#E5DFD6] last:border-0 hover:bg-[#F0EDE8] transition-colors`}
              >
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-lg border font-mono font-bold text-sm ${entry.color}`}>
                    C{entry.symbol}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-[#1C1917]">{entry.nameCN}</td>
                <td className="px-4 py-3 text-[#78716C] hidden sm:table-cell">{entry.name}</td>
                <td className="px-4 py-3 font-mono text-[#F97316] text-xs">{entry.formula}</td>
                <td className="px-4 py-3 font-mono font-bold text-[#1C1917]">{entry.example}</td>
                <td className="px-4 py-3 font-mono text-[#78716C] text-xs hidden md:table-cell">{entry.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-amber-950/40 border border-amber-900/40 rounded-xl text-sm text-amber-300">
        <span className="font-semibold">💡 Wiwi 提示：</span> 和弦代号的规律 —— 不写字母 = 大三和弦，加 <code className="font-mono bg-amber-900/40 px-1 rounded">m</code> = 小三和弦，加
        {" "}<code className="font-mono bg-amber-900/40 px-1 rounded">maj7</code> = 大七度，单独 <code className="font-mono bg-amber-900/40 px-1 rounded">7</code> = 小七度（属七）。
        掌握这个逻辑，所有代号都能推导。
      </div>
    </section>
  );
}

// ── 音程区 ───────────────────────────────────────────────────
function IntervalsSection() {
  const qualityColors: Record<string, string> = {
    "完全": "bg-sky-900/40 text-sky-400",
    "大": "bg-emerald-900/40 text-emerald-400",
    "小": "bg-indigo-900/40 text-indigo-400",
    "增": "bg-orange-900/40 text-orange-400",
    "减": "bg-rose-900/40 text-rose-400",
  };

  return (
    <section id="intervals" className="mt-16">
      <SectionHeader icon="📏" title="音程一览" subtitle="基于 NiceChord 第2章：一次搞懂音程名称" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INTERVALS.map((iv) => (
          <div
            key={iv.semitones}
            className="bg-white border border-[#E5DFD6] rounded-xl p-4 hover:border-[#F97316]/40 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-2xl font-bold text-[#1C1917] font-mono">{iv.abbr}</span>
                <span className="ml-2 text-sm text-[#78716C]">{iv.semitones} 半音</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${qualityColors[iv.quality] ?? "bg-[#F0EDE8] text-[#57534E]"}`}>
                {iv.quality}
              </span>
            </div>
            <p className="font-semibold text-[#57534E] text-sm">{iv.nameCN}</p>
            <p className="text-xs text-[#78716C] mb-2">{iv.name}</p>
            <p className="font-mono text-xs text-[#F97316] mb-1">{iv.example}</p>
            <p className="text-xs text-[#78716C] italic">{iv.feel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 调式区 ───────────────────────────────────────────────────
function ModesSection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="modes" className="mt-16">
      <SectionHeader icon="🌈" title="七种调式" subtitle="基于 NiceChord 第8-10章：Ionian / Dorian / Phrygian / Lydian / Mixolydian / Aeolian / Locrian" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {MODES.map((mode) => (
          <button
            key={mode.degree}
            onClick={() => setSelected(selected === mode.degree ? null : mode.degree)}
            className={`text-left rounded-xl border-2 p-4 transition-all ${
              selected === mode.degree
                ? `${mode.borderColor} shadow-md scale-[1.02]`
                : "border-[#E5DFD6] hover:border-[#C8C2BA]"
            } ${mode.bgColor}`}
          >
            <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 bg-gradient-to-r ${mode.color} text-white`}>
              {mode.degree}号调式
            </div>
            <h3 className="font-bold text-[#1C1917]">{mode.name}</h3>
            <p className="text-sm text-[#78716C] mb-2">{mode.nameCN}</p>
            <p className="font-mono text-xs text-[#57534E] mb-2">{mode.steps}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#78716C]">主和弦：</span>
              <code className="text-xs font-bold text-[#F97316] font-mono">{mode.chordType}</code>
            </div>
            <p className="text-xs text-[#78716C] mt-2 leading-relaxed">{mode.mood}</p>
          </button>
        ))}
      </div>

      {selected !== null && (() => {
        const mode = MODES.find((m) => m.degree === selected)!;
        return (
          <div className={`rounded-xl border-2 ${mode.borderColor} ${mode.bgColor} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${mode.color} flex items-center justify-center text-white font-bold`}>
                {mode.degree}
              </div>
              <div>
                <h3 className="font-bold text-[#1C1917] text-lg">{mode.name} — {mode.nameCN}</h3>
                <p className="text-sm text-[#78716C]">从 C 大调第 {mode.degree} 个音开始演奏</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#78716C] uppercase mb-1">音阶公式</p>
                <p className="font-mono text-sm text-[#57534E]">{mode.formula}</p>
                <p className="font-mono text-sm font-bold text-[#F97316] mt-1">{mode.steps}</p>
                {/* 可视化音格 */}
                <div className="flex gap-1 mt-3">
                  {mode.intervals.map((_, i) => {
                    const step = i < mode.intervals.length - 1
                      ? mode.intervals[i + 1] - mode.intervals[i]
                      : null;
                    const notes = mode.steps.split(" ");
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono
                          bg-gradient-to-br ${mode.color} text-white shadow-sm`}>
                          {notes[i]}
                        </div>
                        {step !== null && (
                          <span className={`text-xs font-mono ${step === 1 ? "text-rose-400 font-bold" : "text-[#78716C]"}`}>
                            {step === 1 ? "H" : "W"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#78716C] uppercase mb-1">应用场景</p>
                <p className="text-sm text-[#57534E]">{mode.example}</p>
                <p className="text-xs font-semibold text-[#78716C] uppercase mt-3 mb-1">情绪色彩</p>
                <p className="text-sm text-[#57534E]">{mode.mood}</p>
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-[#E5DFD6]">
                  <p className="text-xs text-[#57534E]"><span className="font-semibold">💡 Wiwi 提示：</span> {mode.tip}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

// ── 大调自然和弦区 ────────────────────────────────────────────
function DiatonicSection() {
  const functionInfo = {
    "主":   { label: "主功能 (Tonic)",    color: "bg-sky-950/40 border-sky-900/40",   badge: "bg-sky-900/40 text-sky-400" },
    "下属": { label: "下属功能 (Subdominant)", color: "bg-green-950/40 border-green-900/40", badge: "bg-green-900/40 text-green-400" },
    "属":   { label: "属功能 (Dominant)", color: "bg-amber-950/40 border-amber-900/40", badge: "bg-amber-900/40 text-amber-400" },
  };

  return (
    <section id="diatonic" className="mt-16">
      <SectionHeader icon="🏠" title="C大调自然和弦" subtitle="大调音阶内的七个自然和弦及其功能" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        {C_MAJOR_DIATONIC.map((ch) => {
          const fi = functionInfo[ch.function as keyof typeof functionInfo];
          return (
            <div key={ch.degree} className={`rounded-xl border-2 p-3 text-center ${fi.color}`}>
              <p className="text-lg font-bold text-[#57534E] font-mono">{ch.degree}</p>
              <p className="font-mono font-bold text-[#F97316] text-sm mt-1">{ch.name}</p>
              <p className="text-xs text-[#78716C] mt-1 font-mono">{ch.type}</p>
              <span className={`mt-2 inline-block px-1.5 py-0.5 rounded text-xs font-medium ${fi.badge}`}>
                {ch.function}
              </span>
              <p className="text-xs text-[#78716C] mt-2 leading-tight">{ch.mood}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(functionInfo).map(([fn, fi]) => (
          <div key={fn} className={`rounded-xl border ${fi.color} p-4`}>
            <h4 className="font-semibold text-[#1C1917] mb-1">{fi.label}</h4>
            <p className="text-sm text-[#57534E]">
              {fn === "主" && "稳定，有回家感。Ⅰ、Ⅲm、Ⅵm 都具有主功能。"}
              {fn === "下属" && "离开家，流动感。Ⅱm、Ⅳ 具有下属功能，常接属功能。"}
              {fn === "属" && "强烈张力，想解决回主。Ⅴ7 是最强的属和弦，Ⅶm♭5 也属此类。"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-[#F97316]/10 border border-[#F97316]/40 rounded-xl text-sm text-[#C2410C]">
        <span className="font-semibold">💡 NiceChord 故事记忆法：</span> 想像一趟旅程 —— 家（C）→ 朋友家（Em）→ 旅馆（Am）→ 跨出一步（F）→ 桥（Dm）→ 外面（G7）→ 回家（C）
      </div>
    </section>
  );
}

// ── 常用进行区 ────────────────────────────────────────────────
function ProgressionsSection() {
  const [active, setActive] = useState<string>("1625");
  const prog = PROGRESSIONS.find((p) => p.id === active)!;

  const styleColors: Record<string, string> = {
    "流行": "bg-pink-900/40 text-pink-400",
    "爵士": "bg-indigo-900/40 text-indigo-400",
    "蓝调": "bg-blue-900/40 text-blue-400",
    "摇滚": "bg-red-900/40 text-red-400",
    "放克": "bg-orange-900/40 text-orange-400",
    "Neo Soul": "bg-purple-900/40 text-purple-400",
    "基础": "bg-[#F0EDE8] text-[#57534E]",
    "万能": "bg-amber-900/40 text-amber-400",
    "核心": "bg-emerald-900/40 text-emerald-400",
    "现代": "bg-cyan-900/40 text-cyan-400",
    "华语": "bg-rose-900/40 text-rose-400",
    "小调": "bg-violet-900/40 text-violet-400",
    "Dorian": "bg-indigo-900/40 text-indigo-400",
    "经典结构": "bg-[#F0EDE8] text-[#57534E]",
  };

  return (
    <section id="progressions" className="mt-16">
      <SectionHeader icon="🔄" title="常用和弦进行" subtitle="从 1625 到 12-bar Blues，最实用的进行模板" />

      <div className="flex flex-wrap gap-2 mb-6">
        {PROGRESSIONS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              active === p.id
                ? "bg-[#F97316] text-white shadow-md"
                : "bg-white border border-[#E5DFD6] text-[#57534E] hover:border-[#F97316]/40"
            }`}
          >
            {p.nameCN}
          </button>
        ))}
      </div>

      {prog && (
        <div className="bg-white rounded-xl border border-[#E5DFD6] overflow-hidden">
          <div className="p-5 border-b border-[#E5DFD6]">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-xl font-bold text-[#1C1917]">{prog.nameCN}
                <span className="ml-2 text-sm font-normal text-[#78716C]">{prog.name}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {prog.tags.map((tag) => (
                  <Tag key={tag} color={styleColors[tag] ?? "bg-[#F0EDE8] text-[#57534E]"}>{tag}</Tag>
                ))}
              </div>
            </div>
            <p className="text-sm text-[#57534E]">{prog.description}</p>
          </div>

          {/* 和弦块 */}
          <div className="p-5">
            <p className="text-xs font-semibold text-[#78716C] uppercase mb-3">级数 → C调实例</p>
            <div className="flex flex-wrap gap-3">
              {prog.degrees.map((deg, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-16 rounded-xl bg-[#F97316] text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-xs opacity-70 font-mono">{deg}</span>
                    <span className="text-base font-bold font-mono">{prog.inC[i]}</span>
                  </div>
                  {i < prog.degrees.length - 1 && (
                    <span className="inline-block mt-1 text-[#B8B2AA] text-lg">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#78716C] mt-3">风格：{prog.style}</p>
          </div>
        </div>
      )}
    </section>
  );
}

// ── 五度圈区 ─────────────────────────────────────────────────
function FifthsSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 180, cy = 180, R_outer = 150, R_inner = 95;

  const getPos = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: Math.round((cx + r * Math.cos(rad)) * 1000) / 1000,
      y: Math.round((cy + r * Math.sin(rad)) * 1000) / 1000,
    };
  };

  return (
    <section id="fifths" className="mt-16">
      <SectionHeader icon="⭕" title="五度圈" subtitle="基于 NiceChord 第11章：什么是五度循环" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SVG 五度圈 */}
        <div className="flex-shrink-0">
          <svg width={360} height={360} className="drop-shadow-sm">
            {/* 背景圆 */}
            <circle cx={cx} cy={cy} r={R_outer + 16} fill="#F0EDE8" stroke="#E5DFD6" strokeWidth={1} />
            <circle cx={cx} cy={cy} r={R_inner - 10} fill="#FAFAF8" stroke="#E5DFD6" strokeWidth={1} />

            {CIRCLE_OF_FIFTHS.map((entry) => {
              const posOuter = getPos(entry.angle, R_outer);
              const posInner = getPos(entry.angle, R_inner);
              const isHovered = hovered === entry.position;

              return (
                <g
                  key={entry.position}
                  onMouseEnter={() => setHovered(entry.position)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  {/* 大调圆圈 */}
                  <circle
                    cx={posOuter.x}
                    cy={posOuter.y}
                    r={18}
                    fill={isHovered ? "#F97316" : "#E5DFD6"}
                    stroke={isHovered ? "#F97316" : "#C8C2BA"}
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-all"
                  />
                  <text
                    x={posOuter.x}
                    y={posOuter.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={entry.major.length > 2 ? 8 : 11}
                    fontWeight="bold"
                    fill={isHovered ? "white" : "#1C1917"}
                    className="transition-all select-none"
                  >
                    {entry.major}
                  </text>

                  {/* 小调圆圈 */}
                  <circle
                    cx={posInner.x}
                    cy={posInner.y}
                    r={13}
                    fill={isHovered ? "#F97316]/20" : "#EAE5DC"}
                    stroke={isHovered ? "#F97316" : "#C8C2BA"}
                    strokeWidth={isHovered ? 1.5 : 1}
                    className="transition-all"
                  />
                  <text
                    x={posInner.x}
                    y={posInner.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={entry.minor.length > 3 ? 7 : 9}
                    fill={isHovered ? "#C2410C" : "#78716C"}
                    className="transition-all select-none"
                  >
                    {entry.minor}
                  </text>
                </g>
              );
            })}

            {/* 中心标签 */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#78716C">外圈大调</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize={11} fill="#78716C">内圈小调</text>
          </svg>
        </div>

        {/* 说明表格 */}
        <div className="flex-1">
          <div className="overflow-x-auto rounded-xl border border-[#E5DFD6] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F0EDE8] border-b border-[#E5DFD6]">
                  <th className="text-left px-3 py-2 font-semibold text-[#57534E]">大调</th>
                  <th className="text-left px-3 py-2 font-semibold text-[#57534E]">小调</th>
                  <th className="text-left px-3 py-2 font-semibold text-[#57534E]">升/降号</th>
                </tr>
              </thead>
              <tbody>
                {CIRCLE_OF_FIFTHS.map((entry) => (
                  <tr
                    key={entry.position}
                    onMouseEnter={() => setHovered(entry.position)}
                    onMouseLeave={() => setHovered(null)}
                    className={`border-b border-[#E5DFD6] last:border-0 cursor-pointer transition-colors ${
                      hovered === entry.position ? "bg-[#F97316]/10" : "hover:bg-[#F0EDE8]"
                    }`}
                  >
                    <td className="px-3 py-2 font-bold font-mono text-[#F97316]">{entry.major}</td>
                    <td className="px-3 py-2 font-mono text-[#78716C]">{entry.minor}</td>
                    <td className="px-3 py-2 text-[#78716C] text-xs">
                      {entry.sharps > 0
                        ? `${entry.sharps}个♯`
                        : entry.flats > 0
                        ? `${entry.flats}个♭`
                        : "无升降号"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#78716C] mt-3 leading-relaxed">
            💡 五度圈中相邻的调只差一个升降号。顺时针每走一格 = 增加一个升号（向上五度）；逆时针每走一格 = 增加一个降号（向下五度）。
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 副属和弦区 ────────────────────────────────────────────────
function SecondarySection() {
  return (
    <section id="secondary" className="mt-16">
      <SectionHeader icon="➕" title="副属和弦" subtitle="基于 NiceChord 第12章：让和弦进行更有戏剧感" />

      <div className="bg-white rounded-xl border border-[#E5DFD6] overflow-hidden mb-4">
        <div className="p-4 bg-amber-950/40 border-b border-amber-900/40">
          <p className="text-sm text-amber-300">
            <span className="font-bold">原理：</span>每个和弦都可以有自己的「属和弦」。在到达目标和弦之前，
            先经过它的属七和弦（高五度的属七），就能制造额外的张力和解决感。写作符号：<code className="bg-amber-900/40 px-1 rounded font-mono">Ⅴ7/X</code>，读作「X的属七」。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0EDE8] border-b border-[#E5DFD6]">
                <th className="text-left px-4 py-3 font-semibold text-[#57534E]">目标和弦</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E]">级数写法</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E]">C调示例</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E] hidden md:table-cell">说明</th>
              </tr>
            </thead>
            <tbody>
              {SECONDARY_DOMINANTS.map((sd) => (
                <tr key={sd.target} className="border-b border-[#E5DFD6] last:border-0 hover:bg-[#F0EDE8]">
                  <td className="px-4 py-3 font-mono font-bold text-[#1C1917]">{sd.target}</td>
                  <td className="px-4 py-3 font-mono text-[#F97316]">{sd.chordDegree}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <code className="bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded font-mono font-bold text-xs">{sd.chord}</code>
                      <span className="text-[#78716C]">→</span>
                      <code className="bg-[#F0EDE8] text-[#57534E] px-2 py-0.5 rounded font-mono text-xs">{sd.target}</code>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#78716C] text-xs hidden md:table-cell">{sd.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-[#F97316]/10 border border-[#F97316]/40 rounded-xl text-sm text-[#C2410C]">
        <span className="font-semibold">💡 最常用场景：</span> <code className="font-mono bg-[#F97316]/20 px-1 rounded">E7 → Am7</code>（Ⅴ7/Ⅵ）
        是华语流行最爱的手法，在大调歌曲里突然用 E7 制造小调感，极具戏剧效果。
      </div>
    </section>
  );
}

// ── 借用和弦区 ────────────────────────────────────────────────
function BorrowedSection() {
  return (
    <section id="borrowed" className="mt-16">
      <SectionHeader icon="🎭" title="借用和弦" subtitle="基于 NiceChord 第24章：从平行调借用和弦，打破大调的「单调感」" />

      <div className="bg-white rounded-xl border border-[#E5DFD6] overflow-hidden mb-4">
        <div className="p-4 bg-violet-950/40 border-b border-violet-900/40">
          <p className="text-sm text-violet-300">
            <span className="font-bold">原理：</span>在大调歌曲中，临时「借用」同名小调（平行小调）中的和弦来使用。
            例如 C 大调可以借用 C 小调的 ♭VII（B♭）、♭VI（A♭）、Ⅳm（Fm）等和弦，
            增加大调进行的色彩变化。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F0EDE8] border-b border-[#E5DFD6]">
                <th className="text-left px-4 py-3 font-semibold text-[#57534E]">借用和弦</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E]">来源</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E]">C调</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E] hidden sm:table-cell">用法</th>
                <th className="text-left px-4 py-3 font-semibold text-[#57534E] hidden md:table-cell">进行示例</th>
              </tr>
            </thead>
            <tbody>
              {BORROWED_CHORDS.map((bc) => (
                <tr key={bc.degree} className="border-b border-[#E5DFD6] last:border-0 hover:bg-[#F0EDE8]">
                  <td className="px-4 py-3 font-mono font-bold text-violet-400">{bc.degree}</td>
                  <td className="px-4 py-3 text-xs text-[#78716C]">{bc.from}</td>
                  <td className="px-4 py-3">
                    <code className="bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded font-mono font-bold text-xs">{bc.inC}</code>
                  </td>
                  <td className="px-4 py-3 text-[#57534E] text-xs hidden sm:table-cell">{bc.usage}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#78716C] hidden md:table-cell">{bc.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-violet-950/40 border border-violet-900/40 rounded-xl text-sm text-violet-300">
        <span className="font-semibold">💡 Wiwi 的核心观念：</span> 借用和弦不是「错的音」，而是有意识地打破调性边界。
        关键是借来之后要「回家」——解决回大调主和弦，这样听众会感到「惊喜感」而非「不对感」。
      </div>
    </section>
  );
}

// ── 通用 Section Header ───────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold text-[#1C1917] font-[family-name:var(--font-space-grotesk)]">{title}</h2>
      </div>
      <p className="text-sm text-[#78716C] ml-11">{subtitle}</p>
      <div className="mt-3 h-px bg-[#E5DFD6]" />
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────────────
export default function TheoryPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("chords");

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Header */}
      <AppHeader title="乐理知识库" subtitle="基于 NiceChord 好和弦 · 官大为（Wiwi）著" />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8 flex gap-6">
          {/* 侧边导航 */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl border border-[#E5DFD6] overflow-hidden">
              <div className="p-3 bg-[#F0EDE8] border-b border-[#E5DFD6]">
                <p className="text-xs font-semibold text-[#78716C] uppercase font-[family-name:var(--font-space-grotesk)]">章节导航</p>
              </div>
              <nav className="p-2">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeSection === sec.id
                        ? "bg-[#F97316]/10 text-[#F97316] font-medium"
                        : "text-[#57534E] hover:bg-[#F0EDE8]"
                    }`}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* 主内容 */}
          <main className="flex-1 min-w-0 space-y-2">
            {/* 移动端导航 */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === sec.id
                      ? "bg-[#F97316] text-white"
                      : "bg-white border border-[#E5DFD6] text-[#57534E]"
                  }`}
                >
                  {sec.icon} {sec.label}
                </button>
              ))}
            </div>

            <QuizSection />
            <ChordSymbolsSection />
            <IntervalsSection />
            <ModesSection />
            <DiatonicSection />
            <ProgressionsSection />
            <FifthsSection />
            <SecondarySection />
            <BorrowedSection />
          </main>
        </div>
      </div>
    </>
  );
}
