"use client";

import { useState, useRef } from "react";
import type { ChordChart, ChordLine, ChordSection, TabStep } from "@/types/tab";
import ChordDiagram from "./ChordDiagram";
import StringRoll from "./StringRoll";
import TabGrid from "./TabGrid";

interface Props {
  chart: ChordChart;
  editMode: boolean;
  onChange: (chart: ChordChart) => void;
}

// ── Chord Token (view + edit) ─────────────────────────────────────────────
function ChordToken({
  chord, editMode, onRename, onDelete,
}: {
  chord: string;
  editMode: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(chord);
  const inputRef = useRef<HTMLInputElement>(null);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        autoFocus
        className="w-16 px-1 py-0.5 rounded text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-400 outline-none"
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { if (val.trim()) onRename(val.trim()); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { if (val.trim()) onRename(val.trim()); setEditing(false); }
          if (e.key === "Escape") { setVal(chord); setEditing(false); }
        }}
      />
    );
  }

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <button
        onClick={() => editMode ? setEditing(true) : setOpen((v) => !v)}
        className={`px-1.5 py-0.5 rounded text-xs font-bold font-mono leading-none transition-colors ${
          editMode
            ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-dashed border-indigo-400"
            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
        }`}
      >
        {chord}
      </button>
      {editMode && (
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-xs leading-none">×</button>
      )}
      {!editMode && open && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-white border border-stone-200 rounded-xl p-3 shadow-2xl flex flex-col items-center gap-1 min-w-max">
            <span className="text-sm font-bold text-stone-900">{chord}</span>
            <ChordDiagram chordName={chord} size="md" />
          </span>
        </>
      )}
    </span>
  );
}

// ── Add Chord Button ──────────────────────────────────────────────────────
function AddChordBtn({ onAdd }: { onAdd: (chord: string, position: number) => void }) {
  const [open, setOpen] = useState(false);
  const [chord, setChord] = useState("");
  const [pos, setPos] = useState("");

  const submit = () => {
    if (!chord.trim()) return;
    onAdd(chord.trim(), parseInt(pos) || 0);
    setChord(""); setPos(""); setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-1.5 py-0.5 rounded text-xs text-stone-400 border border-dashed border-stone-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
        + 和弦
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <input autoFocus value={chord} onChange={e => setChord(e.target.value)}
        placeholder="和弦名" className="w-16 px-1 py-0.5 rounded text-xs bg-white border border-indigo-400 text-stone-900 outline-none" />
      <input value={pos} onChange={e => setPos(e.target.value)}
        placeholder="位置" className="w-10 px-1 py-0.5 rounded text-xs bg-white border border-stone-300 text-stone-900 outline-none" />
      <button onClick={submit} className="text-xs text-indigo-600 hover:text-indigo-800">✓</button>
      <button onClick={() => setOpen(false)} className="text-xs text-stone-400 hover:text-stone-700">✕</button>
    </span>
  );
}

// ── Strum Pattern Edit Field ──────────────────────────────────────────────
function StrumPatternField({
  pattern, placeholder, onChange,
}: {
  pattern?: string;
  placeholder?: string;
  onChange: (val: string | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(pattern ?? "");

  const commit = () => {
    const trimmed = val.trim();
    onChange(trimmed || undefined);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(pattern ?? ""); setEditing(false); } }}
          placeholder={placeholder ?? "6 4 3 2 1 2 或 ↓ ↓↑ ↑ ↓↑"}
          className="px-2 py-0.5 rounded text-xs font-mono bg-white border border-amber-400 text-amber-700 outline-none w-44"
        />
        <button onClick={commit} className="text-xs text-amber-600 hover:text-amber-800">✓</button>
        <button onClick={() => { setVal(pattern ?? ""); setEditing(false); }} className="text-xs text-stone-400 hover:text-stone-700">✕</button>
      </span>
    );
  }

  if (pattern) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-mono text-amber-600 hover:text-amber-700 border border-dashed border-amber-400 rounded px-1.5 py-0.5 transition-colors"
        title="点击编辑节奏型"
      >
        ✎ {pattern}
      </button>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-xs text-stone-400 hover:text-amber-600 border border-dashed border-stone-300 rounded px-1.5 py-0.5 transition-colors"
      title="添加节奏型/弦序"
    >
      + 弦序
    </button>
  );
}

// ── Lyric Line ────────────────────────────────────────────────────────────
function LyricLine({
  line, editMode,
  onChordRename, onChordDelete, onChordAdd, onLyricsChange, onStrumPatternChange, onTabStepsChange,
}: {
  line: ChordLine;
  editMode: boolean;
  onChordRename: (idx: number, name: string) => void;
  onChordDelete: (idx: number) => void;
  onChordAdd: (chord: string, position: number) => void;
  onLyricsChange: (lyrics: string) => void;
  onStrumPatternChange: (pattern: string | undefined) => void;
  onTabStepsChange: (steps: TabStep[] | undefined) => void;
}) {
  const [editingLyrics, setEditingLyrics] = useState(false);
  const [lyricsVal, setLyricsVal] = useState(line.lyrics);
  const sorted = [...line.chords].sort((a, b) => a.position - b.position);

  // Instrumental line (no lyrics)
  if (!line.lyrics) {
    const hasTabSteps = line.tabSteps && line.tabSteps.length > 0;
    return (
      <div className="py-1 space-y-2">
        {/* Chord tokens row */}
        <div className="flex flex-wrap gap-2 items-center">
          {sorted.map((c, i) => (
            <ChordToken key={i} chord={c.chord} editMode={editMode}
              onRename={(n) => onChordRename(i, n)} onDelete={() => onChordDelete(i)} />
          ))}
          {editMode && <AddChordBtn onAdd={onChordAdd} />}
        </div>

        {/* TabGrid — precise 6-string notation (preferred) */}
        {hasTabSteps && (
          <div className="pl-1 overflow-x-auto">
            <TabGrid
              steps={line.tabSteps!}
              editMode={editMode}
              size="sm"
              onChange={editMode ? (steps) => onTabStepsChange(steps) : undefined}
            />
          </div>
        )}

        {/* StringRoll — simple strumPattern fallback (only when no tabSteps) */}
        {!hasTabSteps && line.strumPattern && !editMode && (
          <div className="pl-1">
            <StringRoll pattern={line.strumPattern} size="sm" />
          </div>
        )}

        {/* Edit mode controls */}
        {editMode && (
          <div className="flex flex-wrap items-center gap-3 pl-1">
            {/* Add tabSteps button (when none exist yet) */}
            {!hasTabSteps && (
              <button
                onClick={() => onTabStepsChange([
                  { strings: [null, null, null, null, null, null] },
                  { strings: [null, null, null, null, null, null] },
                  { strings: [null, null, null, null, null, null] },
                  { strings: [null, null, null, null, null, null] },
                ])}
                className="text-xs text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-300 rounded px-2 py-0.5 bg-indigo-50 transition-colors"
                title="添加精准品格网格"
              >
                + 品格谱
              </button>
            )}
            {/* Remove tabSteps button */}
            {hasTabSteps && (
              <button
                onClick={() => onTabStepsChange(undefined)}
                className="text-xs text-red-500 hover:text-red-700 border border-dashed border-red-200 rounded px-2 py-0.5 transition-colors"
                title="移除品格谱"
              >
                移除品格谱
              </button>
            )}
            {/* strumPattern field (only shown when no tabSteps — simpler mode) */}
            {!hasTabSteps && (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-stone-400">弦序:</span>
                <StrumPatternField
                  pattern={line.strumPattern}
                  placeholder="如 6 3 2 1 2 3"
                  onChange={onStrumPatternChange}
                />
                {line.strumPattern && <StringRoll pattern={line.strumPattern} size="sm" />}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const chars = Array.from(line.lyrics);
  const chordMap = new Map<number, { chord: string; origIdx: number }>();
  sorted.forEach((c, si) => {
    const pos = Math.max(0, c.position);
    chordMap.set(pos, { chord: c.chord, origIdx: line.chords.indexOf(c) });
  });

  const maxPos = sorted.length > 0 ? Math.max(...sorted.map(c => c.position)) : -1;
  const totalCols = Math.max(chars.length, maxPos + 1);
  const charWidth = "1.6em";

  const chordRow: React.ReactNode[] = [];
  const lyricsRow: React.ReactNode[] = [];

  for (let i = 0; i < totalCols; i++) {
    const entry = chordMap.get(i);
    const char = chars[i] ?? "\u00A0";
    chordRow.push(
      <span key={`c-${i}`} className="inline-flex justify-start" style={{ minWidth: charWidth }}>
        {entry
          ? <ChordToken chord={entry.chord} editMode={editMode}
              onRename={(n) => onChordRename(entry.origIdx, n)}
              onDelete={() => onChordDelete(entry.origIdx)} />
          : <span className="inline-block" style={{ minWidth: charWidth }} />}
      </span>
    );
    lyricsRow.push(
      <span key={`l-${i}`} className="inline-flex justify-center text-stone-700" style={{ minWidth: charWidth }}>
        {char}
      </span>
    );
  }

  return (
    <div className="py-1">
      <div className="flex flex-wrap items-center text-sm leading-6 gap-1">
        {chordRow}
        {editMode && <AddChordBtn onAdd={onChordAdd} />}
      </div>
      {editMode && editingLyrics ? (
        <input
          autoFocus
          value={lyricsVal}
          onChange={e => setLyricsVal(e.target.value)}
          onBlur={() => { onLyricsChange(lyricsVal); setEditingLyrics(false); }}
          onKeyDown={e => { if (e.key === "Enter") { onLyricsChange(lyricsVal); setEditingLyrics(false); } }}
          className="w-full px-2 py-1 rounded bg-white border border-indigo-400 text-stone-900 text-base outline-none"
        />
      ) : (
        <div
          className={`flex flex-wrap text-base leading-7 ${editMode ? "cursor-text hover:bg-stone-100/80 rounded px-1" : ""}`}
          onClick={() => editMode && setEditingLyrics(true)}
          title={editMode ? "点击编辑歌词" : undefined}
        >
          {lyricsRow}
          {editMode && <span className="text-stone-400 text-xs self-center ml-1">✎</span>}
        </div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────
function Section({
  section, sectionIdx, editMode, onChange,
}: {
  section: ChordSection;
  sectionIdx: number;
  editMode: boolean;
  onChange: (s: ChordSection) => void;
}) {
  const updateLine = (lineIdx: number, newLine: ChordLine) => {
    const lines = section.lines.map((l, i) => i === lineIdx ? newLine : l);
    onChange({ ...section, lines });
  };

  const hasLinePatterns = section.lines.some(l => l.strumPattern);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
          {section.name}
        </span>
        {/* Section-level strumPattern: show StringRoll when no per-line patterns; show text label when per-line exists */}
        {!editMode && section.strumPattern && !hasLinePatterns && (
          <StringRoll pattern={section.strumPattern} size="sm" />
        )}
        {!editMode && section.strumPattern && hasLinePatterns && (
          <span className="text-xs text-stone-400 font-mono">{section.strumPattern}</span>
        )}
        {/* Edit mode: section-level pattern editor (for strum sections like 主歌/副歌) */}
        {editMode && (
          <span className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400">节奏型:</span>
            <StrumPatternField
              pattern={section.strumPattern}
              placeholder="如 ↓ ↓↑ ↑ ↓↑ 或 6 4 3 2 1 2"
              onChange={(p) => onChange({ ...section, strumPattern: p })}
            />
          </span>
        )}
      </div>
      <div className="space-y-3">
        {section.lines.map((line, li) => (
          <LyricLine
            key={li} line={line} editMode={editMode}
            onChordRename={(ci, name) => {
              const chords = line.chords.map((c, i) => i === ci ? { ...c, chord: name } : c);
              updateLine(li, { ...line, chords });
            }}
            onChordDelete={(ci) => {
              const chords = line.chords.filter((_, i) => i !== ci);
              updateLine(li, { ...line, chords });
            }}
            onChordAdd={(chord, position) => {
              const chords = [...line.chords, { chord, position }];
              updateLine(li, { ...line, chords });
            }}
            onLyricsChange={(lyrics) => updateLine(li, { ...line, lyrics })}
            onStrumPatternChange={(pattern) => updateLine(li, { ...line, strumPattern: pattern })}
            onTabStepsChange={(steps) => updateLine(li, { ...line, tabSteps: steps })}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ChordChart({ chart, editMode, onChange }: Props) {
  const updateSection = (si: number, section: ChordSection) => {
    const sections = chart.sections.map((s, i) => i === si ? section : s);
    onChange({ ...chart, sections });
  };

  return (
    <div className="space-y-8">
      {chart.sections.map((section, i) => (
        <Section
          key={i} section={section} sectionIdx={i}
          editMode={editMode}
          onChange={(s) => updateSection(i, s)}
        />
      ))}
    </div>
  );
}
