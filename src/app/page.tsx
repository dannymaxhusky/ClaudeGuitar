"use client";

import { useState, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import TabAnalysisResult from "@/components/TabAnalysisResult";
import SongLibrary from "@/components/SongLibrary";
import type { TabAnalysis } from "@/types/tab";

// Compress image to max 1200px wide, quality 0.85
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      let { width, height } = img;
      if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.85);
    };
    img.src = url;
  });
}

interface PageItem {
  file: File;
  preview: string;
  id: string;
}

export default function Home() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [analysis, setAnalysis] = useState<TabAnalysis | null>(null);
  const [rawAnalysis, setRawAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{ src: string; x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    const newPages: PageItem[] = arr.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setPages((prev) => [...prev, ...newPages]);
    setAnalysis(null);
    setRawAnalysis(null);
    setError(null);
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Drag-to-reorder handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIndex(index);
    setHoverPreview(null);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleAnalyze = async () => {
    if (pages.length === 0) return;
    setLoading(true);
    setElapsed(0);
    setError(null);
    setAnalysis(null);
    setRawAnalysis(null);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    try {
      const formData = new FormData();
      for (const p of pages) {
        const compressed = await compressImage(p.file);
        formData.append("files", compressed, p.file.name.replace(/\.\w+$/, ".jpg"));
      }

      const res = await fetch("/api/recognize-tab", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "分析失败");
      } else if (data.analysis) {
        setAnalysis(data.analysis);
      } else if (data.rawAnalysis) {
        setRawAnalysis(data.rawAnalysis);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <>
      {/* Hover zoom preview */}
      {hoverPreview && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl overflow-hidden shadow-2xl border border-[#E5DFD6] bg-white"
          style={{
            left: Math.min(hoverPreview.x, window.innerWidth - 420),
            top: Math.max(8, Math.min(hoverPreview.y, window.innerHeight - 520)),
            width: 400,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hoverPreview.src} alt="预览" className="w-full object-contain" />
        </div>
      )}
      <AppHeader
        title="六线谱识别"
        subtitle="AI 六线谱识别与分析"
        extra={<SongLibrary onLoad={(a) => { setAnalysis(a); setPages([]); setError(null); }} />}
      />

      <main className="flex-1 overflow-auto px-4 lg:px-10 py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#57534E] font-[family-name:var(--font-space-grotesk)]">上传六线谱</h2>
            {pages.length > 0 && (
              <span className="text-sm text-[#78716C]">共 {pages.length} 页</span>
            )}
          </div>

          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-[#F97316] bg-[#F97316]/10"
                : "border-[#E5DFD6] hover:border-[#C8C2BA] bg-white"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
            />
            <div className="text-3xl mb-2">🎵</div>
            <p className="text-[#57534E] font-medium">
              {pages.length > 0 ? "点击追加更多页" : "拖拽或点击上传（可多选）"}
            </p>
            <p className="text-sm text-[#78716C] mt-1">上传后可拖拽缩略图调整页面顺序</p>
          </div>

          {/* Page thumbnails — draggable to reorder */}
          {pages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[#78716C]">
                拖拽页面缩略图可调整顺序，确认顺序正确后再分析
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pages.map((page, i) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={(e) => onDrop(e, i)}
                    onDragEnd={onDragEnd}
                    onMouseMove={(e) => {
                      if (dragIndex !== null) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoverPreview({ src: page.preview, x: rect.right + 12, y: rect.top });
                    }}
                    onMouseLeave={() => setHoverPreview(null)}
                    className={`relative group rounded-lg overflow-hidden bg-white border cursor-grab active:cursor-grabbing transition-all select-none ${
                      dragIndex === i
                        ? "opacity-40 scale-95 border-[#F97316]"
                        : dragOverIndex === i
                        ? "border-[#F97316] ring-2 ring-[#F97316]/30"
                        : "border-[#E5DFD6] hover:border-[#C8C2BA]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.preview}
                      alt={`第 ${i + 1} 页`}
                      className="w-full h-44 object-contain bg-white pointer-events-none"
                      draggable={false}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#1C1917]/70 px-2 py-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#C2410C]">第 {i + 1} 页</span>
                        <span className="text-[#78716C]">·</span>
                        <span className="text-xs text-[#78716C] truncate max-w-[60px]">{page.file.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removePage(i); }}
                        className="text-[#78716C] hover:text-red-700 text-sm leading-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-[#1C1917]/80 px-1.5 py-0.5 rounded">
                      ⠿ 拖拽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pages.length > 0 && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-[#F97316] hover:bg-[#EA6B0A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  AI 正在分析 {pages.length} 页谱子...
                  <span className="ml-1 tabular-nums text-[#C2410C] text-xs">{elapsed}s</span>
                </span>
              ) : (
                `开始 AI 分析（共 ${pages.length} 页）`
              )}
            </button>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {analysis && <TabAnalysisResult analysis={analysis} />}

        {rawAnalysis && (
          <div className="rounded-xl bg-white border border-[#E5DFD6] p-6">
            <h3 className="font-semibold text-[#57534E] mb-3">分析结果（原始）</h3>
            <pre className="text-sm text-[#78716C] whitespace-pre-wrap">{rawAnalysis}</pre>
          </div>
        )}

        {pages.length === 0 && !analysis && (
          <div className="rounded-xl bg-white border border-[#E5DFD6] p-8 text-center">
            <p className="text-[#78716C] text-sm mb-4">上传六线谱图片后，AI 会帮你分析：</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["和弦识别", "音名标注", "调性分析", "技法标注", "学习建议"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[#F97316]/10 border border-[#F97316]/40 rounded-full text-xs text-[#F97316] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
