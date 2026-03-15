"use client";

import { useState } from "react";
import type { TabAnalysis, Measure, Beat, ChordChart as ChordChartType } from "@/types/tab";
import ChordChart from "./ChordChart";
import PerformanceMode from "./PerformanceMode";

const STRING_NAMES = ["", "1弦(E4)", "2弦(B3)", "3弦(G3)", "4弦(D3)", "5弦(A2)", "6弦(E2)"];
const STRING_COLORS = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-purple-500"];

const STORAGE_KEY = "guitar_saved_songs";

type Tab = "chart" | "detail";

function ChordBadge({ chord }: { chord: string | null }) {
  if (!chord) return null;
  return (
    <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold">
      {chord}
    </span>
  );
}

function BeatBlock({ beat }: { beat: Beat }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 space-y-2 min-w-[120px]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-500">拍 {beat.beat}</span>
        <ChordBadge chord={beat.chord} />
      </div>
      <div className="space-y-1">
        {beat.strings.map((s) => (
          <div key={s.string} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${STRING_COLORS[s.string]}`} />
            <span className="text-xs text-stone-500 w-14">{STRING_NAMES[s.string]}</span>
            <span className="text-xs font-mono text-stone-800">
              {s.fret === 0 ? "○" : s.fret}
            </span>
            <span className="text-xs text-indigo-600 font-medium">{s.note}</span>
            {s.technique && (
              <span className="text-xs text-amber-600">({s.technique})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasureBlock({ measure }: { measure: Measure }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
        第 {measure.measureNumber} 小节
      </div>
      <div className="flex gap-2 flex-wrap">
        {measure.beats.map((beat) => (
          <BeatBlock key={beat.beat} beat={beat} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-stone-900">{value || "—"}</div>
    </div>
  );
}

function BpmStat({ bpm, onChange }: { bpm: number | null; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(bpm ?? ""));

  if (editing) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
        <div className="text-xs text-stone-500 mb-1">速度 BPM</div>
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            const n = parseInt(val);
            if (n >= 20 && n <= 300) onChange(n);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { const n = parseInt(val); if (n >= 20 && n <= 300) onChange(n); setEditing(false); }
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-full bg-transparent text-sm font-semibold text-stone-900 outline-none border-b border-indigo-400"
          placeholder="如 120"
        />
      </div>
    );
  }
  return (
    <button
      onClick={() => { setVal(String(bpm ?? "")); setEditing(true); }}
      className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-4 py-3 text-left w-full transition-colors group"
    >
      <div className="text-xs text-stone-500 mb-1 flex items-center gap-1">
        速度 BPM <span className="opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity">✎</span>
      </div>
      <div className="text-sm font-semibold text-stone-900">{bpm ?? "未设置"}</div>
    </button>
  );
}

function saveSong(analysis: TabAnalysis) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const songs = raw ? JSON.parse(raw) : [];
    const existing = songs.findIndex((s: { analysis: TabAnalysis }) =>
      s.analysis.title === analysis.title
    );
    const entry = { id: `${Date.now()}`, savedAt: Date.now(), analysis };
    if (existing >= 0) {
      songs[existing] = entry;
    } else {
      songs.unshift(entry);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    return true;
  } catch {
    return false;
  }
}

export default function TabAnalysisResult({ analysis: initialAnalysis }: { analysis: TabAnalysis }) {
  const [activeTab, setActiveTab] = useState<Tab>("chart");
  const [editMode, setEditMode] = useState(false);
  const [analysis, setAnalysis] = useState<TabAnalysis>(initialAnalysis);
  const [saved, setSaved] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  const hasChart = analysis.chordChart?.sections?.length > 0;

  const handleSave = () => {
    const ok = saveSong(analysis);
    if (ok) setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChordChartChange = (chart: ChordChartType) => {
    setAnalysis((prev) => ({ ...prev, chordChart: chart }));
  };

  return (
    <div className="space-y-6">
      {performanceMode && (
        <PerformanceMode
          chart={analysis.chordChart}
          title={analysis.title}
          bpm={analysis.bpm ?? undefined}
          onClose={() => setPerformanceMode(false)}
        />
      )}
      {/* Overview */}
      <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-stone-900 mb-4">
          {analysis.title || "六线谱分析结果"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="调性" value={analysis.key} />
          <Stat label="拍号" value={analysis.timeSignature} />
          {analysis.tempo && <Stat label="速度标记" value={analysis.tempo} />}
          <BpmStat bpm={analysis.bpm ?? null} onChange={(v) => setAnalysis((p) => ({ ...p, bpm: v }))} />
          <Stat label="音阶" value={analysis.scale} />
          {analysis.capo && <Stat label="变调夹" value={analysis.capo} />}
          {analysis.totalPages > 1 && <Stat label="页数" value={`共 ${analysis.totalPages} 页`} />}
        </div>
      </div>

      {/* Tab switcher + actions */}
      <div className="flex gap-2 items-center">
        <div className="flex flex-1 gap-1 bg-stone-100 border border-stone-200 rounded-xl p-1">
          {([
            { id: "chart", label: "🎵 和弦图谱" },
            { id: "detail", label: "🔬 详细分析" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {activeTab === "chart" && (
          <div className="flex gap-2">
            <button
              onClick={() => setPerformanceMode(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
            >
              ▶ 弹唱模式
            </button>
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                editMode
                  ? "bg-amber-500 hover:bg-amber-400 text-white"
                  : "bg-stone-200 hover:bg-stone-300 text-stone-700 border border-stone-300"
              }`}
            >
              {editMode ? "完成编辑" : "✎ 编辑"}
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                saved
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {saved ? "✓ 已保存" : "保存"}
            </button>
          </div>
        )}
      </div>

      {/* Tab: Chord Chart */}
      {activeTab === "chart" && (
        <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-6">
          {editMode && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              编辑模式：点击和弦名可修改，× 删除，点击歌词可修改，+ 和弦 可添加新和弦
            </div>
          )}
          {hasChart ? (
            <ChordChart
              chart={analysis.chordChart}
              editMode={editMode}
              onChange={handleChordChartChange}
            />
          ) : (
            <p className="text-stone-500 text-sm text-center py-4">暂无和弦图谱数据</p>
          )}
        </div>
      )}

      {/* Tab: Detail analysis */}
      {activeTab === "detail" && (
        <div className="space-y-6">
          {/* Chord Progression */}
          {analysis.chordProgression?.length > 0 && (
            <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
                和弦进行
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.chordProgression.map((chord, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
                      {chord}
                    </span>
                    {i < analysis.chordProgression.length - 1 && (
                      <span className="text-stone-400">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Measures */}
          {analysis.measures?.length > 0 && (
            <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">
                小节详情 — 每音解析
              </h3>
              <div className="space-y-6">
                {analysis.measures.map((measure) => (
                  <MeasureBlock key={measure.measureNumber} measure={measure} />
                ))}
              </div>
            </div>
          )}

          {/* Techniques */}
          {analysis.techniques?.length > 0 && (
            <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
                使用技法
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.techniques.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Analysis */}
          {analysis.analysis && (
            <div className="rounded-xl bg-white border border-stone-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
                AI 分析 & 学习建议
              </h3>
              <p className="text-stone-700 leading-relaxed">{analysis.analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
