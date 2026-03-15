"use client";

import { useState, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import PlayButton from "@/components/PlayButton";
import { playGuitarFrets } from "@/utils/audio";
import {
  CHORD_TYPES,
  ROOTS,
  ROOT_SEMITONES,
  OPEN_STRING_NAMES,
  getFretNote,
  type CAGEDShape,
  type ChordTypeId,
} from "@/data/cagedData";

// ── 品格图组件 ────────────────────────────────────────────────
interface FretboardDiagramProps {
  shape: CAGEDShape;
  rootNote: string;
  accentColor: string;
  isSelected: boolean;
  onClick: () => void;
}

function FretboardDiagram({ shape, rootNote, accentColor, isSelected, onClick }: FretboardDiagramProps) {
  // 计算目标调的位移量
  const semitones = ROOT_SEMITONES[rootNote] ?? 0;

  // 计算实际按弦品格
  const actualFrets = shape.frets.map((f) => {
    if (f === null || f === 0) return f;
    return f + semitones;
  });

  // 计算显示范围（5品窗口）
  const pressedFrets = actualFrets.filter((f): f is number => f !== null && f > 0);
  const minFret = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1;
  const displayStart = minFret <= 3 ? 1 : minFret - 1;
  const displayEnd = displayStart + 4;

  // 大小参数
  const FRETS = 5;
  const STRING_GAP = 28;
  const FRET_GAP = 32;
  const LEFT_PAD = 36;
  const TOP_PAD = 28;
  const NUT_WIDTH = displayStart === 1 ? 4 : 0;
  const W = LEFT_PAD + FRET_GAP * FRETS + 12;
  const H = TOP_PAD + STRING_GAP * 5 + 28;

  // barre 品格（调整后）
  const barreFret = shape.barre ? shape.barre.fret + semitones : null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group relative rounded-2xl p-3 transition-all border-2 cursor-pointer ${
        isSelected
          ? "border-current shadow-lg scale-[1.03] bg-white"
          : "border-[#E5DFD6] bg-white hover:border-[#C8C2BA]"
      }`}
      style={{ borderColor: isSelected ? accentColor : undefined }}
    >
      {/* 指型标签 */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
        style={{ backgroundColor: accentColor }}
      >
        {shape.shape}型
      </div>

      <svg width={W} height={H} className="overflow-visible">
        {/* 品位标注 */}
        {displayStart > 1 && (
          <text x={LEFT_PAD - 4} y={TOP_PAD + STRING_GAP * 2.5} textAnchor="end" fontSize={10} fill="#9ca3af" dominantBaseline="middle">
            {displayStart}fr
          </text>
        )}

        {/* 弦线 (s=0=低E在下方, s=5=高e在上方) */}
        {[0,1,2,3,4,5].map(s => (
          <line
            key={s}
            x1={LEFT_PAD} y1={TOP_PAD + (5 - s) * STRING_GAP}
            x2={LEFT_PAD + FRET_GAP * FRETS} y2={TOP_PAD + (5 - s) * STRING_GAP}
            stroke="#D6D0C8" strokeWidth={s === 0 ? 2.5 : s === 1 ? 2 : 1.5}
          />
        ))}

        {/* 品格线 */}
        {Array.from({ length: FRETS + 1 }, (_, i) => (
          <line
            key={i}
            x1={LEFT_PAD + i * FRET_GAP} y1={TOP_PAD}
            x2={LEFT_PAD + i * FRET_GAP} y2={TOP_PAD + STRING_GAP * 5}
            stroke={i === 0 && displayStart === 1 ? "#292524" : "#D6D0C8"}
            strokeWidth={i === 0 && displayStart === 1 ? NUT_WIDTH : 1}
          />
        ))}

        {/* barre 横按 (弦序已反转：to 对应更高位置) */}
        {barreFret !== null && shape.barre && barreFret >= displayStart && barreFret <= displayEnd && (() => {
          const fx = LEFT_PAD + (barreFret - displayStart + 0.5) * FRET_GAP;
          const topY = TOP_PAD + (5 - shape.barre.to) * STRING_GAP;
          const barreH = (shape.barre.to - shape.barre.from) * STRING_GAP;
          return (
            <rect
              x={fx - 8} y={topY - 8}
              width={16} height={barreH + 16}
              rx={8}
              fill={accentColor}
              opacity={0.85}
            />
          );
        })()}

        {/* 按弦点和 X/O 标记 */}
        {actualFrets.map((fret, stringIdx) => {
          const y = TOP_PAD + (5 - stringIdx) * STRING_GAP;
          const noteAtFret = fret !== null && fret >= 0 ? getFretNote(stringIdx, fret) : "";
          const isRoot = fret !== null && fret >= 0 && noteAtFret === rootNote.replace(/\/.*/, "").replace("#", "#");
          const isRootFromShape = shape.rootStrings.includes(stringIdx);

          if (fret === null) {
            // 静音
            return (
              <text key={stringIdx} x={LEFT_PAD - 10} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="bold" fill="#ef4444">×</text>
            );
          }
          if (fret === 0) {
            // 空弦
            return (
              <circle key={stringIdx} cx={LEFT_PAD - 10} cy={y} r={5} fill="none" stroke={isRoot ? accentColor : "#78716c"} strokeWidth={isRoot ? 2 : 1.5} />
            );
          }
          if (fret >= displayStart && fret <= displayEnd) {
            const x = LEFT_PAD + (fret - displayStart + 0.5) * FRET_GAP;
            const dotColor = (isRoot || isRootFromShape) ? accentColor : "#44403c";
            return (
              <g key={stringIdx}>
                <circle cx={x} cy={y} r={9} fill={dotColor} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="white" fontWeight="bold">
                  {noteAtFret}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* 弦名 (左侧, 低E在下) */}
        {OPEN_STRING_NAMES.map((name, i) => (
          <text key={i} x={10} y={TOP_PAD + (5 - i) * STRING_GAP} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#a8a29e">
            {name}
          </text>
        ))}
      </svg>

      {/* 播放按钮 */}
      <div className="flex justify-center mt-2">
        <PlayButton
          size="sm"
          title={`播放 ${rootNote} ${shape.shape}型和弦`}
          onPlay={() => playGuitarFrets(actualFrets)}
        />
      </div>
    </div>
  );
}

// ── 全指板可视化组件 ─────────────────────────────────────────
interface FullFretboardProps {
  shapes: CAGEDShape[];
  rootNote: string;
  accentColor: string;
  selectedShapeIdx: number | null;
}

function FullFretboard({ shapes, rootNote, accentColor, selectedShapeIdx }: FullFretboardProps) {
  const TOTAL_FRETS = 13;
  const STRING_GAP = 22;
  const FRET_GAP = 40;
  const LEFT_PAD = 30;
  const TOP_PAD = 20;
  const W = LEFT_PAD + FRET_GAP * TOTAL_FRETS + 20;
  const H = TOP_PAD + STRING_GAP * 5 + 30;

  const semitones = ROOT_SEMITONES[rootNote] ?? 0;

  // 标记点品格
  const markerFrets = [3, 5, 7, 9, 12];

  // 计算每个形状覆盖的品格区域（用于高亮）
  const shapeRegions = useMemo(() => shapes.map((shape) => {
    const actualFrets = shape.frets.map((f) => {
      if (f === null || f === 0) return null;
      return (f + semitones - 1) % 12 + 1;
    });
    return actualFrets;
  }), [shapes, semitones]);

  // 所有按弦点（品格+弦）
  const allDots: { fret: number; stringIdx: number; shapeIdx: number; isRoot: boolean }[] = [];
  shapes.forEach((shape, si) => {
    shape.frets.forEach((f, stringIdx) => {
      if (f === null || f === 0) return;
      let actualFret = (f + semitones - 1) % 12 + 1;
      const noteAtFret = getFretNote(stringIdx, actualFret + (actualFret === 0 ? 0 : 0));
      const cleanRoot = rootNote.replace(/\/.*/, "").replace("b", "♭");
      const isRoot = shape.rootStrings.includes(stringIdx) && f === shape.frets[shape.rootStrings[0]];
      allDots.push({ fret: actualFret, stringIdx, shapeIdx: si, isRoot });
    });
  });

  const shapeColors = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e"];

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} className="min-w-0">
        {/* 弦线 (s=0=低E在下方) */}
        {[0,1,2,3,4,5].map(s => (
          <line key={s}
            x1={LEFT_PAD} y1={TOP_PAD + (5 - s) * STRING_GAP}
            x2={LEFT_PAD + FRET_GAP * TOTAL_FRETS} y2={TOP_PAD + (5 - s) * STRING_GAP}
            stroke="#D6D0C8" strokeWidth={s === 0 ? 3 : s === 1 ? 2.5 : 2 - s * 0.2}
          />
        ))}

        {/* 品格线 + 品格号 */}
        {Array.from({ length: TOTAL_FRETS + 1 }, (_, i) => (
          <g key={i}>
            <line
              x1={LEFT_PAD + i * FRET_GAP} y1={TOP_PAD}
              x2={LEFT_PAD + i * FRET_GAP} y2={TOP_PAD + STRING_GAP * 5}
              stroke={i === 0 ? "#292524" : "#D6D0C8"}
              strokeWidth={i === 0 ? 4 : 1}
            />
            {i > 0 && (
              <text x={LEFT_PAD + (i - 0.5) * FRET_GAP} y={TOP_PAD + STRING_GAP * 5 + 14}
                textAnchor="middle" fontSize={9} fill="#a8a29e">
                {i}
              </text>
            )}
          </g>
        ))}

        {/* 品格标记点 */}
        {markerFrets.map(f => (
          f === 12 ? (
            <g key={f}>
              <circle cx={LEFT_PAD + (f - 0.5) * FRET_GAP - 6} cy={TOP_PAD + STRING_GAP * 2.5} r={4} fill="#D6D0C8" />
              <circle cx={LEFT_PAD + (f - 0.5) * FRET_GAP + 6} cy={TOP_PAD + STRING_GAP * 2.5} r={4} fill="#D6D0C8" />
            </g>
          ) : (
            <circle key={f} cx={LEFT_PAD + (f - 0.5) * FRET_GAP} cy={TOP_PAD + STRING_GAP * 2.5} r={4} fill="#D6D0C8" />
          )
        ))}

        {/* 按弦点 */}
        {allDots.map((dot, i) => {
          const x = LEFT_PAD + (dot.fret - 0.5) * FRET_GAP;
          const y = TOP_PAD + (5 - dot.stringIdx) * STRING_GAP;
          const isSelected = selectedShapeIdx === null || selectedShapeIdx === dot.shapeIdx;
          const color = dot.isRoot ? accentColor : shapeColors[dot.shapeIdx % shapeColors.length];
          return (
            <circle key={i}
              cx={x} cy={y} r={8}
              fill={color}
              opacity={isSelected ? 1 : 0.2}
              className="transition-opacity"
            />
          );
        })}

        {/* 弦名 (低E在下) */}
        {OPEN_STRING_NAMES.map((name, i) => (
          <text key={i} x={LEFT_PAD - 6} y={TOP_PAD + (5 - i) * STRING_GAP}
            textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#78716c" fontWeight="bold">
            {name}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── 主页面 ────────────────────────────────────────────────────
export default function CAGEDPage() {
  const [rootNote, setRootNote] = useState("C");
  const [chordTypeId, setChordTypeId] = useState<ChordTypeId>("major");
  const [selectedShape, setSelectedShape] = useState<number | null>(null);

  const currentType = CHORD_TYPES.find(t => t.id === chordTypeId)!;
  const shapes = currentType.shapes;
  const accentColor = {
    major: "#0ea5e9",
    minor: "#6366f1",
    maj7: "#10b981",
    dom7: "#f59e0b",
    m7: "#8b5cf6",
    halfdim: "#f43f5e",
  }[chordTypeId];

  const chordName = `${rootNote.replace("/", "/")}${currentType.symbol}`;

  return (
    <>
      {/* Header */}
      <AppHeader title="CAGED 和弦指型系统" subtitle="基于《吉他新思维》第5章 · 五种指型全覆盖指板" />

      <main className="flex-1 overflow-auto px-4 lg:px-10 py-8 space-y-8">

        {/* 选择控件 */}
        <div className="bg-white rounded-2xl border border-[#E5DFD6] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 根音选择 */}
            <div>
              <p className="text-xs font-semibold text-[#78716C] uppercase mb-3 font-[family-name:var(--font-space-grotesk)]">根音 Root</p>
              <div className="flex flex-wrap gap-2">
                {ROOTS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRootNote(r); setSelectedShape(null); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold font-mono transition-all ${
                      rootNote === r
                        ? "text-white shadow-md scale-105"
                        : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                    }`}
                    style={rootNote === r ? { backgroundColor: accentColor } : {}}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 和弦类型选择 */}
            <div>
              <p className="text-xs font-semibold text-[#78716C] uppercase mb-3 font-[family-name:var(--font-space-grotesk)]">和弦类型 Chord Type</p>
              <div className="flex flex-wrap gap-2">
                {CHORD_TYPES.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => { setChordTypeId(ct.id); setSelectedShape(null); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      chordTypeId === ct.id
                        ? "text-white shadow-md"
                        : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                    }`}
                    style={chordTypeId === ct.id ? { backgroundColor: accentColor } : {}}
                  >
                    {ct.label}
                    <span className="ml-1 font-mono text-xs opacity-70">{ct.symbol || "△"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 当前和弦名 */}
          <div className="mt-4 pt-4 border-t border-[#E5DFD6] flex items-center gap-3">
            <span
              className="text-3xl font-bold font-mono"
              style={{ color: accentColor }}
            >
              {chordName}
            </span>
            <span className="text-[#78716C] text-sm">· {currentType.label}</span>
            <span className="ml-auto text-xs text-[#78716C] bg-[#F0EDE8] border border-[#E5DFD6] px-2 py-1 rounded-lg">
              点击指型卡片查看详情，点击全指板的点可筛选单个指型
            </span>
          </div>
        </div>

        {/* 五种指型卡片 */}
        <div>
          <h2 className="text-lg font-semibold text-[#57534E] mb-4 flex items-center gap-2 font-[family-name:var(--font-space-grotesk)]">
            <span style={{ color: accentColor }}>◆</span> 五种指型位置
            <span className="text-sm font-normal text-[#78716C] ml-2">— 覆盖整个指板</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {shapes.map((shape, idx) => (
              <div key={shape.shape} className="flex flex-col items-center gap-2">
                <FretboardDiagram
                  shape={shape}
                  rootNote={rootNote}
                  accentColor={accentColor}
                  isSelected={selectedShape === idx}
                  onClick={() => setSelectedShape(selectedShape === idx ? null : idx)}
                />
                <p className="text-xs text-[#78716C] text-center">
                  根音在{shape.rootStrings.map(s => `第${s + 1}弦`).join("/")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 全指板视图 */}
        <div className="bg-white rounded-2xl border border-[#E5DFD6] p-6">
          <h2 className="text-lg font-semibold text-[#57534E] mb-1 flex items-center gap-2 font-[family-name:var(--font-space-grotesk)]">
            <span style={{ color: accentColor }}>◆</span> 全指板分布
          </h2>
          <p className="text-sm text-[#78716C] mb-5">
            五种指型叠加显示（点击上方指型卡片单独高亮）
          </p>
          <FullFretboard
            shapes={shapes as unknown as CAGEDShape[]}
            rootNote={rootNote}
            accentColor={accentColor}
            selectedShapeIdx={selectedShape}
          />

          {/* 指型图例 */}
          <div className="mt-4 flex flex-wrap gap-3">
            {shapes.map((shape, idx) => {
              const colors = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];
              return (
                <button
                  key={shape.shape}
                  onClick={() => setSelectedShape(selectedShape === idx ? null : idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    selectedShape === idx
                      ? "border-current bg-white shadow-sm"
                      : selectedShape === null
                      ? "border-[#E5DFD6] bg-[#F0EDE8] text-[#57534E]"
                      : "border-[#E5DFD6] bg-[#F0EDE8] text-[#C8C2BA]"
                  }`}
                  style={{ borderColor: selectedShape === idx ? colors[idx] : undefined, color: selectedShape === idx ? colors[idx] : undefined }}
                >
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colors[idx] }} />
                  {shape.shape}型
                </button>
              );
            })}
            <button
              onClick={() => setSelectedShape(null)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E5DFD6] bg-[#F0EDE8] text-[#78716C] hover:bg-[#EAE5DC] transition-colors"
            >
              全部显示
            </button>
          </div>
        </div>

        {/* CAGED 系统说明 */}
        <div className="bg-white rounded-2xl border border-[#E5DFD6] p-6">
          <h2 className="text-lg font-semibold text-[#57534E] mb-4 font-[family-name:var(--font-space-grotesk)]">💡 CAGED 系统是什么？</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#57534E] leading-relaxed">
            <div>
              <p className="mb-3">
                CAGED 系统是用五种开放和弦指型（<strong className="text-[#1C1917]">C、A、G、E、D</strong>）来覆盖吉他整个指板的方法。
                每种指型都可以通过移调（加横按）演奏任何调性的和弦。
              </p>
              <p className="mb-3">
                这五种指型按顺序排列，<strong className="text-[#1C1917]">相邻的两个指型总是重叠连接</strong>，形成一个无缝覆盖整个指板的系统。
              </p>
              <p>
                掌握 CAGED 系统后，你能在指板上任何位置弹出相同的和弦，并理解和弦音与音阶之间的关系。
              </p>
            </div>
            <div className="space-y-2">
              {[
                { shape: "C", root: "5弦/2弦", tip: "开放指型，适合低把位" },
                { shape: "A", root: "5弦", tip: "横按5弦根音，最常用的移调指型" },
                { shape: "G", root: "6弦/1弦", tip: "根音在6弦，覆盖范围广" },
                { shape: "E", root: "6弦", tip: "最基础的指型，横按变调方便" },
                { shape: "D", root: "4弦", tip: "根音在4弦，高把位常用" },
              ].map(({ shape, root, tip }) => (
                <div key={shape} className="flex items-start gap-3 p-3 rounded-lg bg-[#F0EDE8]">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: accentColor }}
                  >
                    {shape}
                  </span>
                  <div>
                    <p className="font-semibold text-[#1C1917]">{shape}型 <span className="font-normal text-[#78716C]">根音在{root}</span></p>
                    <p className="text-[#78716C]">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 练习建议 */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}88)` }}
        >
          <h2 className="text-lg font-bold mb-3">🎯 《吉他新思维》第5章练习要点</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { step: "1", text: "先练习各指型在 C 调的形状，确认每个音的音名" },
              { step: "2", text: "选一个根音（如 G），找出5个指型的位置并练习衔接" },
              { step: "3", text: "同一进行（如 1625）用不同指型演奏，感受音色变化" },
              { step: "4", text: "结合音阶：每个 CAGED 指型都对应一个五声音阶位置" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/30 text-xs flex items-center justify-center font-bold">{step}</span>
                <p className="opacity-90">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
