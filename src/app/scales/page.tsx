"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { playFretboardNote } from "@/utils/audio";
import {
  SCALES,
  SCALE_CATEGORIES,
  DISPLAY_NOTES,
  DISPLAY_STRINGS,
  DISPLAY_STRING_NAMES,
  ROOT_LABELS,
  getIntervalColor,
  type ScaleType,
} from "@/data/scaleData";

// ── Fretboard layout constants (all integers → no hydration mismatch) ──
const FW = 48;   // fret width px
const SH = 28;   // string spacing px
const ML = 28;   // left margin (string name labels)
const MT = 28;   // top margin (fret number labels)
const OW = 40;   // open-string column width
const NUT_X = ML + OW; // x of nut line = 68
const NFRETS = 12;
const NSTRINGS = 6;
const DOT_R = 11; // dot radius
const SVG_W = NUT_X + NFRETS * FW + 20; // 664
const SVG_H = MT + (NSTRINGS - 1) * SH + 28; // 196

// x-center of a fret position (f=0 → open string column center)
function fx(f: number): number {
  return f === 0 ? ML + OW / 2 : NUT_X + (f * 2 - 1) * (FW / 2);
}
// y-center of display string row i (0 = high e, 5 = low E)
function sy(i: number): number {
  return MT + i * SH;
}

const LANDMARK_FRETS = new Set([3, 5, 7, 9, 12]);

// ── Scale helper hooks ──────────────────────────────────────────────────

function useScaleCompute(rootIdx: number, scale: ScaleType) {
  const intervalSet = new Set(scale.intervals);

  function getInterval(noteSemitone: number): number | null {
    const iv = ((noteSemitone - rootIdx) % 12 + 12) % 12;
    return intervalSet.has(iv) ? iv : null;
  }

  function degreeLabel(interval: number): string {
    const idx = scale.intervals.indexOf(interval);
    return idx >= 0 ? scale.degrees[idx] : "";
  }

  const notesInScale: { display: string; interval: number }[] = scale.intervals.map((iv) => ({
    display: DISPLAY_NOTES[(rootIdx + iv) % 12],
    interval: iv,
  }));

  return { getInterval, degreeLabel, notesInScale };
}

// ── Fretboard SVG ───────────────────────────────────────────────────────

interface FretboardProps {
  rootIdx: number;
  scale: ScaleType;
  labelMode: "degree" | "note";
}

function Fretboard({ rootIdx, scale, labelMode }: FretboardProps) {
  const { getInterval, degreeLabel } = useScaleCompute(rootIdx, scale);

  return (
    <div className="overflow-x-auto">
      <svg width={SVG_W} height={SVG_H} style={{ display: "block" }}>
        {/* ── Position markers ── */}
        {[3, 5, 7, 9].map((f) => (
          <circle
            key={f}
            cx={NUT_X + (f * 2 - 1) * (FW / 2)}
            cy={SVG_H - 10}
            r={4}
            fill="#d6d3d1"
          />
        ))}
        {/* Double dot at 12 */}
        <circle cx={NUT_X + 23 * (FW / 2)} cy={SVG_H - 16} r={4} fill="#d6d3d1" />
        <circle cx={NUT_X + 23 * (FW / 2)} cy={SVG_H - 4} r={4} fill="#d6d3d1" />

        {/* ── String lines ── */}
        {Array.from({ length: NSTRINGS }, (_, s) => (
          <line
            key={s}
            x1={ML}
            y1={sy(s)}
            x2={SVG_W - 20}
            y2={sy(s)}
            stroke="#A8A29E"
            strokeWidth={s >= 3 ? 2 : 1}
          />
        ))}

        {/* ── Fret wires (index 0 = nut) ── */}
        {Array.from({ length: NFRETS + 1 }, (_, f) => (
          <line
            key={f}
            x1={NUT_X + f * FW}
            y1={MT}
            x2={NUT_X + f * FW}
            y2={MT + (NSTRINGS - 1) * SH}
            stroke={f === 0 ? "#1c1917" : "#D6D0C8"}
            strokeWidth={f === 0 ? 5 : 1}
          />
        ))}

        {/* ── String name labels ── */}
        {DISPLAY_STRING_NAMES.map((name, s) => (
          <text
            key={s}
            x={ML - 6}
            y={sy(s) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#78716c"
            fontFamily="monospace"
          >
            {name}
          </text>
        ))}

        {/* ── Fret number labels (landmark frets only) ── */}
        {Array.from({ length: NFRETS }, (_, i) => {
          const f = i + 1;
          if (!LANDMARK_FRETS.has(f)) return null;
          return (
            <text
              key={f}
              x={NUT_X + (f * 2 - 1) * (FW / 2)}
              y={MT - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#a8a29e"
              fontFamily="monospace"
            >
              {f}
            </text>
          );
        })}

        {/* ── Open label ── */}
        <text
          x={ML + OW / 2}
          y={MT - 8}
          textAnchor="middle"
          fontSize={10}
          fill="#a8a29e"
          fontFamily="monospace"
        >
          O
        </text>

        {/* ── Scale dots ── */}
        {Array.from({ length: NSTRINGS }, (_, s) =>
          Array.from({ length: NFRETS + 1 }, (_, f) => {
            const noteSemitone = (DISPLAY_STRINGS[s] + f) % 12;
            const interval = getInterval(noteSemitone);
            if (interval === null) return null;

            const color = getIntervalColor(interval);
            const noteLabel =
              labelMode === "degree"
                ? degreeLabel(interval)
                : DISPLAY_NOTES[(rootIdx + interval) % 12];
            const dotX = fx(f);
            const dotY = sy(s);

            return (
              <g
                key={`${s}-${f}`}
                onClick={() => playFretboardNote(s, f)}
                className="cursor-pointer"
                style={{ filter: "drop-shadow(0 0 0 transparent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "")}
              >
                <circle cx={dotX} cy={dotY} r={DOT_R} fill={color} />
                <text
                  x={dotX}
                  y={dotY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={noteLabel.length > 1 ? 7 : 8}
                  fontWeight={interval === 0 ? "bold" : "normal"}
                  fill="white"
                  fontFamily="system-ui, sans-serif"
                  style={{ pointerEvents: "none" }}
                >
                  {noteLabel}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function ScalesPage() {
  const [rootIdx, setRootIdx] = useState(0); // C
  const [scaleId, setScaleId] = useState("minorPentatonic");
  const [activeCategory, setActiveCategory] = useState("pentatonic");
  const [labelMode, setLabelMode] = useState<"degree" | "note">("degree");

  const scale = SCALES.find((s) => s.id === scaleId) ?? SCALES[0];
  const { notesInScale } = useScaleCompute(rootIdx, scale);

  function selectCategory(catId: string) {
    setActiveCategory(catId);
    const first = SCALES.find((s) => s.category === catId);
    if (first) setScaleId(first.id);
  }

  return (
    <>
      {/* Header */}
      <AppHeader title="音阶练习器" subtitle="基于《吉他新思维》第6–14章 · 指板可视化" />

      <main className="flex-1 overflow-auto px-4 lg:px-10 py-8 space-y-6">
        {/* ── Selectors ── */}
        <div className="bg-white rounded-xl border border-[#E5DFD6] p-4 space-y-4">
          {/* Root */}
          <div>
            <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2 font-[family-name:var(--font-space-grotesk)]">根音 ROOT</p>
            <div className="flex flex-wrap gap-2">
              {ROOT_LABELS.map((r, i) => (
                <button
                  key={r}
                  onClick={() => setRootIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    rootIdx === i
                      ? "bg-[#F97316] text-white"
                      : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div>
            <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2 font-[family-name:var(--font-space-grotesk)]">音阶类型</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SCALE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-[#F97316] text-white"
                      : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {SCALES.filter((s) => s.category === activeCategory).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScaleId(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    scaleId === s.id
                      ? "bg-[#F97316] text-white"
                      : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Scale info ── */}
        <div className="bg-white rounded-xl border border-[#E5DFD6] p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1C1917] font-[family-name:var(--font-space-grotesk)]">
                {ROOT_LABELS[rootIdx]} {scale.name}
                <span className="text-[#78716C] text-sm font-normal ml-2">{scale.nameEn}</span>
              </h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {notesInScale.map(({ display, interval }, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: getIntervalColor(interval) + "22",
                      color: getIntervalColor(interval),
                    }}
                  >
                    <span className="opacity-60">{scale.degrees[i]}</span>
                    <span>{display}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-[#78716C] mb-1">音程公式</p>
              <code className="text-sm font-mono bg-[#F0EDE8] px-2 py-1 rounded text-[#57534E]">
                {scale.formula}
              </code>
            </div>
          </div>
          <p className="text-sm text-[#57534E] mt-3">{scale.description}</p>

          {/* Label mode toggle */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5DFD6]">
            <span className="text-xs text-[#78716C]">指板标注：</span>
            {(["degree", "note"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setLabelMode(m)}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  labelMode === m ? "bg-[#F97316] text-white" : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                }`}
              >
                {m === "degree" ? "级数" : "音名"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Fretboard ── */}
        <div className="bg-white rounded-xl border border-[#E5DFD6] p-4">
          <h3 className="text-sm font-semibold text-[#57534E] mb-3 font-[family-name:var(--font-space-grotesk)]">指板音阶分布（全颈）</h3>
          <Fretboard rootIdx={rootIdx} scale={scale} labelMode={labelMode} />

          {/* Color legend */}
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[#E5DFD6]">
            {[
              { color: "#4f46e5", label: "根音 1" },
              { color: "#16a34a", label: "三度 3/♭3" },
              { color: "#2563eb", label: "五度 5" },
              { color: "#d97706", label: "七度 7/♭7" },
              { color: "#dc2626", label: "♭5 蓝调音" },
              { color: "#78716c", label: "其他音" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-[#57534E]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Practice tips ── */}
        <div className="bg-gradient-to-br from-indigo-950 to-blue-950 rounded-xl border border-indigo-900/40 p-5">
          <h3 className="font-semibold text-indigo-400 mb-4">🎯 《吉他新思维》练习建议</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { n: "1", tip: "先在一根弦上练习整条音阶，感受每个音的音程间距" },
              { n: "2", tip: "找出根音（深色圆点）在指板上的所有位置，以根音为导航" },
              { n: "3", tip: "练习跨弦连接：把相邻把位的音阶连成一片" },
              { n: "4", tip: "用节拍器，从 60 BPM 开始上行下行，逐步加速到 120 BPM" },
              { n: "5", tip: "结合 CAGED：每个 CAGED 指型都有对应的五声/大调音阶把位" },
              { n: "6", tip: "即兴时聚焦骨干音：根音、三度、五度是最安全的强调音" },
            ].map(({ n, tip }) => (
              <div key={n} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-900 text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {n}
                </span>
                <p className="text-sm text-indigo-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mode quick-reference ── */}
        <div className="bg-white rounded-xl border border-[#E5DFD6] p-4">
          <h3 className="text-sm font-semibold text-[#57534E] mb-3 font-[family-name:var(--font-space-grotesk)]">📊 调式速查 · 各调式用于哪个级数和弦</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#57534E] border-collapse">
              <thead>
                <tr className="border-b border-[#E5DFD6]">
                  <th className="text-left py-2 pr-4 font-semibold text-[#1C1917]">调式</th>
                  <th className="text-left py-2 pr-4 font-semibold text-[#1C1917]">用于和弦级数</th>
                  <th className="text-left py-2 pr-4 font-semibold text-[#1C1917]">色彩</th>
                  <th className="text-left py-2 font-semibold text-[#1C1917]">代表艺人</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Ionian (大调)", chord: "I (大三和弦)", mood: "明亮、稳定", artist: "流行、民谣" },
                  { name: "Dorian", chord: "ii (小三和弦)", mood: "忧郁但有希望", artist: "Santana, Miles Davis" },
                  { name: "Phrygian", chord: "iii (小三和弦)", mood: "神秘、西班牙风", artist: "Metallica, Flamenco" },
                  { name: "Lydian", chord: "IV (大三和弦)", mood: "梦幻、飘逸", artist: "Joe Satriani, 电影配乐" },
                  { name: "Mixolydian", chord: "V (属七和弦)", mood: "蓝调、摇滚感", artist: "Beatles, 摇滚即兴" },
                  { name: "Aeolian (自然小调)", chord: "vi (小三和弦)", mood: "忧郁、感伤", artist: "流行、摇滚" },
                  { name: "Locrian", chord: "vii° (半减七)", mood: "不稳定、紧张", artist: "爵士、金属" },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-[#E5DFD6] hover:bg-[#F0EDE8]">
                    <td className="py-2 pr-4 font-medium text-[#1C1917]">{row.name}</td>
                    <td className="py-2 pr-4 font-mono text-[#F97316]">{row.chord}</td>
                    <td className="py-2 pr-4">{row.mood}</td>
                    <td className="py-2 text-[#78716C]">{row.artist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
