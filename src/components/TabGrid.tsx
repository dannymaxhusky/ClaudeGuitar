"use client";

import { useState } from "react";
import type { TabStep, StringFret } from "@/types/tab";

// ── String metadata (top = string 1 = high e, bottom = string 6 = low E) ─
const STRINGS = [
  { label: "e", color: "#a78bfa", thin: true },   // string 1
  { label: "B", color: "#60a5fa", thin: true },   // string 2
  { label: "G", color: "#34d399", thin: false },  // string 3
  { label: "D", color: "#fbbf24", thin: false },  // string 4
  { label: "A", color: "#f97316", thin: false },  // string 5
  { label: "E", color: "#f87171", thin: false },  // string 6
];

// ── Cell value helpers ────────────────────────────────────────────────────
function cellDisplay(v: StringFret): string {
  if (v === null || v === undefined) return "";
  if (v === "x") return "×";
  return String(v);
}

function parseCellInput(raw: string): StringFret {
  const t = raw.trim().toLowerCase();
  if (!t || t === "-") return null;
  if (t === "x" || t === "×") return "x";
  const n = parseInt(t, 10);
  return isNaN(n) ? null : Math.max(0, Math.min(24, n));
}

function cellBg(v: StringFret, active: boolean, str: typeof STRINGS[0]): string {
  if (active) return str.color + "26"; // ~15% opacity tint
  if (v === null || v === undefined) return "#f9fafb";
  if (v === "x") return "#f9fafb";
  return str.color + "18"; // ~10% opacity
}

// ── Single editable cell ──────────────────────────────────────────────────
function Cell({
  value, active, strIdx, editMode, onChange,
}: {
  value: StringFret;
  active: boolean;
  strIdx: number;
  editMode: boolean;
  onChange: (v: StringFret) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const str = STRINGS[strIdx];
  const display = cellDisplay(value);

  const commit = (raw: string) => {
    onChange(parseCellInput(raw));
    setEditing(false);
  };

  if (editMode && editing) {
    return (
      <td
        style={{ width: 28, height: 24, padding: 0, border: "1px solid " + str.color }}
        className="bg-white"
      >
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={e => {
            if (e.key === "Enter") commit(draft);
            if (e.key === "Escape") { setEditing(false); }
            if (e.key === "x" || e.key === "X") { commit("x"); }
            if (e.key === "Delete" || e.key === "Backspace") { commit(""); }
          }}
          placeholder="0-24/x"
          className="w-full h-full text-center text-xs font-mono bg-white text-stone-900 outline-none"
        />
      </td>
    );
  }

  return (
    <td
      onClick={() => { if (editMode) { setDraft(display); setEditing(true); } }}
      style={{
        width: 28,
        height: 24,
        padding: 0,
        textAlign: "center",
        fontSize: 11,
        fontFamily: "monospace",
        fontWeight: 600,
        color: value === null || value === undefined ? "transparent" : str.color,
        background: cellBg(value, active, str),
        border: active
          ? `1px solid ${str.color}88`
          : "1px solid #e5e7eb",
        cursor: editMode ? "pointer" : "default",
        transition: "background 0.1s",
        boxShadow: active && (value !== null && value !== undefined)
          ? `0 0 6px ${str.color}66`
          : "none",
        userSelect: "none",
      }}
      title={editMode ? "点击编辑（0-24=品格, x=闷弦, 空=不弹）" : undefined}
    >
      {display || (editMode ? <span style={{ color: "#9ca3af", fontSize: 9 }}>·</span> : "")}
    </td>
  );
}

// ── TabGrid component ─────────────────────────────────────────────────────
interface Props {
  steps: TabStep[];
  currentStep?: number; // -1 = none active
  editMode?: boolean;
  onChange?: (steps: TabStep[]) => void;
  size?: "sm" | "md";
}

function emptyStep(): TabStep {
  return { strings: [null, null, null, null, null, null] };
}

export default function TabGrid({
  steps,
  currentStep = -1,
  editMode = false,
  onChange,
  size = "md",
}: Props) {
  const updateCell = (stepIdx: number, strIdx: number, val: StringFret) => {
    if (!onChange) return;
    const next = steps.map((s, si) =>
      si === stepIdx
        ? { strings: s.strings.map((v, vi) => vi === strIdx ? val : v) as TabStep["strings"] }
        : s
    );
    onChange(next);
  };

  const addStep = () => {
    onChange?.([...steps, emptyStep()]);
  };

  const deleteStep = (idx: number) => {
    onChange?.(steps.filter((_, i) => i !== idx));
  };

  const scale = size === "sm" ? 0.85 : 1;

  return (
    <div
      className="inline-flex flex-col gap-0.5 select-none"
      style={{ transform: `scale(${scale})`, transformOrigin: "left top" }}
    >
      {/* Step index header */}
      <div className="flex items-center gap-0">
        {/* string label spacer */}
        <div style={{ width: 18 }} />
        {steps.map((_, si) => (
          <div
            key={si}
            style={{ width: 28, textAlign: "center" }}
            className="relative group"
          >
            <span
              className={`text-[9px] font-mono ${si === currentStep ? "text-indigo-700 font-bold" : "text-stone-400"}`}
            >
              {si + 1}
            </span>
            {editMode && (
              <button
                onClick={() => deleteStep(si)}
                className="absolute -top-1 left-1/2 -translate-x-1/2 hidden group-hover:block text-[9px] text-red-500 hover:text-red-700 leading-none"
                title="删除此步"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <button
            onClick={addStep}
            className="ml-1 text-[10px] text-stone-400 hover:text-indigo-600 border border-dashed border-stone-300 rounded px-1 py-0.5 transition-colors"
            title="添加步"
          >
            +
          </button>
        )}
      </div>

      {/* 6 string rows */}
      <table style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
        <tbody>
          {STRINGS.map((str, strIdx) => (
            <tr key={strIdx}>
              {/* String label */}
              <td
                style={{
                  width: 18,
                  textAlign: "right",
                  paddingRight: 3,
                  fontSize: 10,
                  fontWeight: 700,
                  color: str.color,
                  fontFamily: "monospace",
                  opacity: 0.85,
                }}
              >
                {str.label}
              </td>
              {steps.map((step, si) => (
                <Cell
                  key={si}
                  value={step.strings[strIdx]}
                  active={si === currentStep}
                  strIdx={strIdx}
                  editMode={editMode}
                  onChange={(v) => updateCell(si, strIdx, v)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit hint */}
      {editMode && (
        <div className="text-stone-400 mt-0.5 pl-5" style={{ fontSize: 9 }}>
          点击格子输入品格(0-24) · 输入x=闷弦 · 空格/Delete=清空 · 列序号下悬停可删列
        </div>
      )}
    </div>
  );
}
