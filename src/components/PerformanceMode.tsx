"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { ChordChart } from "@/types/tab";
import StringRoll from "./StringRoll";

interface FlatLine {
  sectionName: string;
  sectionIdx: number;
  isFirstInSection: boolean;
  isLastInSection: boolean;
  lyrics: string;
  measuresPerLine: number;
  chords: { chord: string; position: number; beat?: number }[];
  strumPattern?: string;
}

interface SectionInfo {
  name: string;
  startIdx: number;
  endIdx: number;
}

function buildLines(chart: ChordChart): { lines: FlatLine[]; sections: SectionInfo[] } {
  const lines: FlatLine[] = [];
  const sections: SectionInfo[] = [];
  let idx = 0;
  chart.sections.forEach((section, si) => {
    const startIdx = idx;
    section.lines.forEach((line, li) => {
      lines.push({
        sectionName: section.name,
        sectionIdx: si,
        isFirstInSection: li === 0,
        isLastInSection: li === section.lines.length - 1,
        lyrics: line.lyrics,
        measuresPerLine: line.measures ?? 1,
        chords: [...line.chords].sort((a, b) => a.position - b.position),
        strumPattern: line.strumPattern ?? section.strumPattern,
      });
      idx++;
    });
    sections.push({ name: section.name, startIdx, endIdx: idx - 1 });
  });
  return { lines, sections };
}

function getActiveChordIdx(
  chords: { chord: string; position: number; beat?: number }[],
  progress: number, // 0..1
  totalBeats: number
): number {
  if (chords.length === 0) return -1;
  const hasBeat = chords.some((c) => c.beat !== undefined);
  if (hasBeat) {
    const currentBeat = progress * totalBeats;
    let activeIdx = 0;
    for (let i = 0; i < chords.length; i++) {
      if ((chords[i].beat ?? 0) <= currentBeat) activeIdx = i;
      else break;
    }
    return activeIdx;
  }
  // Fallback: position-based
  const maxPos = Math.max(...chords.map((c) => c.position), 1);
  const currentPos = progress * maxPos;
  let activeIdx = 0;
  for (let i = 0; i < chords.length; i++) {
    if (chords[i].position <= currentPos) activeIdx = i;
    else break;
  }
  return activeIdx;
}

interface Props {
  chart: ChordChart;
  title: string;
  bpm?: number;
  onClose: () => void;
}

type Phase = "setup" | "countdown" | "playing" | "done";

export default function PerformanceMode({ chart, title, bpm: bpmProp, onClose }: Props) {
  const { lines, sections } = useMemo(() => buildLines(chart), [chart]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [bpm, setBpm] = useState(bpmProp ?? 80);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4); // 4 for 4/4, 3 for 3/4, etc.
  const [loopMode, setLoopMode] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 fraction of current line
  const [countdown, setCountdown] = useState(3);
  const [loopCount, setLoopCount] = useState(0);

  // Refs for interval
  const lineIdxRef = useRef(0);
  const loopRef = useRef(false);
  const rangeStartRef = useRef(0);
  const rangeEndRef = useRef(lines.length - 1);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure; }, [beatsPerMeasure]);

  // Total beats for a given line index
  const getLineBeats = (li: number) => (lines[li]?.measuresPerLine ?? 1) * beatsPerMeasureRef.current;

  // Estimate total duration for selected range
  const rangeLines = selectedSection !== null
    ? lines.slice(sections[selectedSection].startIdx, sections[selectedSection].endIdx + 1)
    : lines;
  const estSecs = Math.round(rangeLines.reduce((s, l) => s + l.measuresPerLine, 0) * beatsPerMeasure * 60 / bpm);
  const estMin = Math.floor(estSecs / 60);
  const estSec = estSecs % 60;

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
    setLoopCount(0);
    let c = 3;
    const id = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(id);
        const start = selectedSection !== null ? sections[selectedSection].startIdx : 0;
        const end = selectedSection !== null ? sections[selectedSection].endIdx : lines.length - 1;
        lineIdxRef.current = start;
        loopRef.current = loopMode;
        rangeStartRef.current = start;
        rangeEndRef.current = end;
        setLineIdx(start);
        setProgress(0);
        setPhase("playing");
      } else {
        setCountdown(c);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, selectedSection, loopMode, sections, lines.length]);

  // Playing — measure-aware timing
  useEffect(() => {
    if (phase !== "playing") return;
    const msPerBeat = (60 / bpm) * 1000;
    const tickMs = Math.max(16, Math.min(msPerBeat / 10, 40));
    let frac = 0;
    let msPerLine = getLineBeats(lineIdxRef.current) * msPerBeat;

    const id = setInterval(() => {
      frac += tickMs / msPerLine;
      if (frac >= 1) {
        frac = 0;
        const next = lineIdxRef.current + 1;
        if (next > rangeEndRef.current) {
          if (loopRef.current) {
            lineIdxRef.current = rangeStartRef.current;
            setLineIdx(rangeStartRef.current);
            msPerLine = getLineBeats(rangeStartRef.current) * msPerBeat;
            setLoopCount((n) => n + 1);
          } else {
            clearInterval(id);
            setPhase("done");
            return;
          }
        } else {
          lineIdxRef.current = next;
          setLineIdx(next);
          msPerLine = getLineBeats(next) * msPerBeat;
        }
      }
      setProgress(frac);
    }, tickMs);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, bpm]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === " ") {
        e.preventDefault();
        if (phase === "setup") setPhase("countdown");
        else if (phase === "playing") setPhase("setup");
        else if (phase === "done") setPhase("setup");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, onClose]);

  const currentLine = lines[lineIdx] ?? lines[lines.length - 1];
  const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : null;
  const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : null;
  const totalBeatsForLine = (currentLine?.measuresPerLine ?? 1) * beatsPerMeasure;
  const activeChordIdx = getActiveChordIdx(currentLine?.chords ?? [], progress, totalBeatsForLine);
  // Current beat within the line (1-indexed for display)
  const currentBeatDisplay = Math.floor(progress * totalBeatsForLine) + 1;
  const activeChord = currentLine?.chords[activeChordIdx]?.chord ?? null;
  const nextChordInLine = currentLine?.chords[activeChordIdx + 1]?.chord;
  const nextChord = nextChordInLine ?? nextLine?.chords[0]?.chord ?? null;

  // In loop mode, "next" wraps to start of section
  const isLastInRange = lineIdx === rangeEndRef.current;
  const effectiveNextChord = loopMode && isLastInRange && !nextChordInLine
    ? lines[rangeStartRef.current]?.chords[0]?.chord ?? null
    : nextChord;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-gray-400 text-sm font-medium truncate">{title || "弹唱模式"}</span>
          {phase === "playing" && loopMode && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-900 border border-green-700 text-green-400 text-xs font-medium">
              🔁 循环 {loopCount > 0 ? `× ${loopCount}` : ""}
            </span>
          )}
          {phase === "playing" && selectedSection !== null && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs">
              {sections[selectedSection].name}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm shrink-0 ml-4">
          ✕ 退出
        </button>
      </div>

      {/* ── Setup ── */}
      {phase === "setup" && (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-8 px-8 py-8">
          <div className="w-full max-w-md space-y-8">

            {/* BPM */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-sm">速度</span>
                <span className="text-white text-3xl font-black tabular-nums">
                  {bpm} <span className="text-gray-500 text-base font-normal">BPM</span>
                </span>
              </div>
              <input
                type="range" min={40} max={200} step={2} value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-2 accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>慢 40</span><span>80</span><span>120</span><span>快 200</span>
              </div>
            </div>

            {/* Beats per measure */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-sm">每小节拍数</span>
                <span className="text-white font-bold">{beatsPerMeasure} 拍 <span className="text-gray-500 text-xs font-normal">/ 小节</span></span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 6].map((b) => (
                  <button key={b} onClick={() => setBeatsPerMeasure(b)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                      beatsPerMeasure === b ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {b === 4 ? "4/4" : b === 3 ? "3/4" : b === 6 ? "6/8" : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Section selector */}
            <div className="space-y-3">
              <span className="text-gray-400 text-sm">从哪段开始</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSection(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSection === null
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  全曲
                </button>
                {sections.map((s, i) => (
                  <button key={i} onClick={() => setSelectedSection(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSection === i
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Loop toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-300 text-sm font-medium">循环练习</div>
                <div className="text-gray-600 text-xs mt-0.5">
                  {selectedSection !== null ? `反复循环「${sections[selectedSection].name}」` : "循环全曲"}
                </div>
              </div>
              <button
                onClick={() => setLoopMode((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors ${loopMode ? "bg-green-600" : "bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${loopMode ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => setPhase("countdown")}
              className="px-16 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xl font-bold transition-all shadow-lg shadow-indigo-900/50"
            >
              {loopMode ? "🔁 开始循环" : "▶ 开始弹唱"}
            </button>
            <p className="text-gray-600 text-xs">
              空格键开始/暂停 · Esc 退出 ·
              {loopMode ? " 循环模式" : ` 约 ${estMin}:${String(estSec).padStart(2, "0")}`}
            </p>
          </div>
        </div>
      )}

      {/* ── Countdown ── */}
      {phase === "countdown" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-sm">
            {selectedSection !== null ? `段落：${sections[selectedSection].name}` : "全曲"}
            {loopMode ? " · 循环模式" : ""}
          </p>
          <div
            key={countdown}
            className="text-9xl font-black text-indigo-400"
            style={{ animation: "countdownPop 0.9s ease-out forwards" }}
          >
            {countdown}
          </div>
          <style>{`
            @keyframes countdownPop {
              0%   { transform: scale(1.4); opacity: 1; }
              80%  { transform: scale(0.95); opacity: 0.9; }
              100% { transform: scale(0.85); opacity: 0.3; }
            }
          `}</style>
        </div>
      )}

      {/* ── Playing ── */}
      {phase === "playing" && (
        <div className="flex-1 flex flex-col justify-center px-8 relative overflow-hidden">
          <div className="space-y-8 max-w-3xl mx-auto w-full">

            {/* Prev line */}
            {prevLine ? (
              <div className="opacity-20 space-y-1">
                {prevLine.isFirstInSection && (
                  <div className="text-xs text-indigo-700 uppercase tracking-widest">{prevLine.sectionName}</div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {prevLine.chords.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-gray-800 font-mono text-sm text-gray-400">{c.chord}</span>
                  ))}
                </div>
                <div className="text-xl text-gray-500">{prevLine.lyrics || "——"}</div>
              </div>
            ) : <div className="h-12" />}

            {/* Current line */}
            <div className="space-y-3">
              {currentLine.isFirstInSection && (
                <div className="text-sm text-indigo-400 uppercase tracking-widest font-semibold">
                  {currentLine.sectionName}
                </div>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                {currentLine.chords.length === 0 && (
                  <span className="text-gray-600 text-sm italic">（无和弦）</span>
                )}
                {currentLine.chords.map((c, i) => (
                  <span key={i}
                    className={`px-3 py-1.5 rounded-xl font-mono font-bold text-base transition-all duration-150 ${
                      i === activeChordIdx
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-900/60 scale-110"
                        : "bg-gray-800 text-gray-400"
                    }`}>
                    {c.chord}
                  </span>
                ))}
              </div>
              <div className="text-4xl font-medium text-white leading-relaxed tracking-wide">
                {currentLine.lyrics || <span className="text-gray-600 italic text-2xl">（器乐段）</span>}
              </div>
              {/* Strum pattern with beat highlight */}
              {currentLine.strumPattern && (() => {
                const steps = currentLine.strumPattern.trim().split(/\s+/).filter(Boolean);
                const currentStep = steps.length > 0
                  ? Math.floor(progress * steps.length) % steps.length
                  : -1;
                return (
                  <StringRoll
                    pattern={currentLine.strumPattern}
                    currentStep={currentStep}
                    size="sm"
                  />
                );
              })()}

              {/* Progress bar — turns green in loop mode */}
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${loopMode ? "bg-green-500" : "bg-indigo-500"}`}
                  style={{ width: `${progress * 100}%`, transition: "width 40ms linear" }}
                />
              </div>
            </div>

            {/* Next line */}
            {nextLine && (!loopMode || !currentLine.isLastInSection) ? (
              <div className="opacity-35 space-y-1">
                {nextLine.isFirstInSection && (
                  <div className="text-xs text-indigo-700 uppercase tracking-widest">{nextLine.sectionName}</div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {nextLine.chords.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-gray-800 font-mono text-sm text-gray-500">{c.chord}</span>
                  ))}
                </div>
                <div className="text-2xl text-gray-600">{nextLine.lyrics || "——"}</div>
              </div>
            ) : loopMode && currentLine.isLastInSection ? (
              <div className="opacity-25 text-green-700 text-sm">🔁 回到段落开头</div>
            ) : (
              <div className="opacity-20 text-gray-600 text-lg">（全曲结束）</div>
            )}
          </div>

          {/* Chord HUD */}
          <div className="absolute bottom-6 right-6 bg-gray-900/95 border border-gray-700 rounded-2xl px-5 py-4 text-right shadow-2xl backdrop-blur min-w-[120px]">
            <div className="text-xs text-gray-600 mb-1">当前和弦</div>
            <div className="text-5xl font-black text-indigo-300 font-mono leading-none">
              {activeChord ?? "—"}
            </div>
            {effectiveNextChord && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="text-xs text-gray-600 mb-1">下一个</div>
                <div className="text-2xl font-bold text-gray-400 font-mono">{effectiveNextChord}</div>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-700 tabular-nums">
              拍 {currentBeatDisplay} / {totalBeatsForLine}
            </div>
          </div>

          {/* Bottom-left: line counter + loop indicator */}
          <div className="absolute bottom-6 left-6 text-gray-700 text-xs space-y-1">
            <div className="tabular-nums">
              {lineIdx - rangeStartRef.current + 1} / {rangeEndRef.current - rangeStartRef.current + 1} 行
            </div>
            {currentLine.measuresPerLine > 1 && (
              <div className="text-gray-800">{currentLine.measuresPerLine} 小节/行</div>
            )}
            {loopMode && loopCount > 0 && (
              <div className="text-green-800">🔁 ×{loopCount}</div>
            )}
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {phase === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-6xl">🎸</div>
          <h2 className="text-2xl font-bold text-white">演奏完成！</h2>
          <p className="text-gray-500 text-sm">{title}</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setPhase("countdown")}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              再来一遍
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
