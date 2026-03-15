"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import {
  LEARNING_PATH,
  DIFFICULTY_LABEL,
  DIFFICULTY_COLOR,
  type Difficulty,
} from "@/data/pathData";

export default function PathPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(1);
  const [filter, setFilter] = useState<Difficulty | "all">("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("guitar-path-progress");
      if (saved) setCompleted(new Set(JSON.parse(saved) as number[]));
    } catch {}
  }, []);

  function toggleCompleted(id: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("guitar-path-progress", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const visibleModules = LEARNING_PATH.filter(
    (m) => filter === "all" || m.difficulty === filter
  );

  const totalDone = completed.size;
  const pct = Math.round((totalDone / LEARNING_PATH.length) * 100);

  return (
    <>
      {/* Header */}
      <AppHeader title="学习路径" subtitle="《吉他新思维》14章系统课程" />

      <main className="flex-1 overflow-auto px-4 lg:px-10 py-8 space-y-6">
        {/* Progress overview */}
        <div className="bg-white rounded-xl border border-[#E5DFD6] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-[#1C1917] font-[family-name:var(--font-space-grotesk)]">学习进度</h2>
              <p className="text-sm text-[#78716C] mt-0.5">
                已完成 <span className="font-bold text-[#F97316]">{totalDone}</span> / {LEARNING_PATH.length} 章
              </p>
            </div>
            <div className="text-3xl font-bold text-[#F97316]">{pct}%</div>
          </div>
          <div className="w-full bg-[#F0EDE8] rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-[#F97316] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Difficulty stats */}
          <div className="flex gap-4 mt-3">
            {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => {
              const total = LEARNING_PATH.filter((m) => m.difficulty === d).length;
              const done = LEARNING_PATH.filter((m) => m.difficulty === d && completed.has(m.id)).length;
              return (
                <div key={d} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DIFFICULTY_COLOR[d] }} />
                  <span className="text-xs text-[#57534E]">
                    {DIFFICULTY_LABEL[d]} {done}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "all", label: "全部" },
            { id: "beginner", label: "入门" },
            { id: "intermediate", label: "进阶" },
            { id: "advanced", label: "高级" },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-[#F97316] text-white"
                  : "bg-white border border-[#E5DFD6] text-[#57534E] hover:bg-[#F0EDE8]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Module list */}
        <div className="space-y-3">
          {visibleModules.map((module) => {
            const done = completed.has(module.id);
            const isOpen = expanded === module.id;

            return (
              <div
                key={module.id}
                className={`bg-white rounded-xl border transition-all ${
                  done ? "border-[#4ADE80]/30" : "border-[#E5DFD6]"
                }`}
              >
                {/* Module header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : module.id)}
                  className="w-full text-left p-4 flex items-start gap-3 cursor-pointer"
                >
                  {/* Completion circle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompleted(module.id);
                    }}
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                      done
                        ? "bg-[#4ADE80] border-[#4ADE80] text-white"
                        : "border-[#C8C2BA] hover:border-[#4ADE80]"
                    }`}
                  >
                    {done && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#78716C]">{module.chapter}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: DIFFICULTY_COLOR[module.difficulty] + "22",
                          color: DIFFICULTY_COLOR[module.difficulty],
                        }}
                      >
                        {DIFFICULTY_LABEL[module.difficulty]}
                      </span>
                      {module.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-[#F0EDE8] text-[#78716C]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className={`font-semibold mt-1 ${done ? "text-[#78716C] line-through" : "text-[#1C1917]"}`}>
                      {module.title}
                      <span className="text-[#78716C] text-sm font-normal ml-2">{module.titleEn}</span>
                    </h3>
                    <p className="text-sm text-[#78716C] mt-1 line-clamp-2">{module.description}</p>
                  </div>

                  <span className="flex-shrink-0 text-[#78716C] text-sm ml-2 mt-1">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-t border-[#E5DFD6] mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {/* Objectives */}
                      <div>
                        <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2 font-[family-name:var(--font-space-grotesk)]">
                          🎯 学习目标
                        </p>
                        <ul className="space-y-1.5">
                          {module.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#57534E]">
                              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#F97316]/20 text-[#F97316] text-xs font-bold flex items-center justify-center mt-0.5">
                                {i + 1}
                              </span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tools */}
                      {module.tools.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2 font-[family-name:var(--font-space-grotesk)]">
                            🔧 练习工具
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {module.tools.map((tool) => (
                              <Link
                                key={tool.href + tool.label}
                                href={tool.href}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: tool.color }}
                              >
                                {tool.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mark complete button */}
                    <button
                      onClick={() => toggleCompleted(module.id)}
                      className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                        done
                          ? "bg-[#F0EDE8] text-[#57534E] hover:bg-[#EAE5DC]"
                          : "bg-[#4ADE80] text-white hover:bg-[#22c55e]"
                      }`}
                    >
                      {done ? "↩ 标记为未完成" : "✓ 标记为已完成"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
