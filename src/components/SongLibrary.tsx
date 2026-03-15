"use client";

import { useState, useEffect } from "react";
import type { SavedSong, TabAnalysis } from "@/types/tab";

const STORAGE_KEY = "guitar_saved_songs";

function loadSongs(): SavedSong[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function deleteSong(id: string) {
  try {
    const songs = loadSongs().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  } catch {}
}

export default function SongLibrary({ onLoad }: { onLoad: (analysis: TabAnalysis) => void }) {
  const [songs, setSongs] = useState<SavedSong[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) setSongs(loadSongs());
  }, [open]);

  if (songs.length === 0 && !open) {
    // Try to check if there are any songs without opening the panel
  }

  const handleDelete = (id: string) => {
    deleteSong(id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      <button
        onClick={() => { setSongs(loadSongs()); setOpen((v) => !v); }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 shadow-sm text-sm font-medium transition-colors"
      >
        <span>📚</span>
        <span>已保存曲谱</span>
        {songs.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs leading-none">
            {songs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 rounded-xl bg-white border border-stone-200 shadow-xl overflow-hidden">
          {songs.length === 0 ? (
            <p className="px-6 py-4 text-sm text-stone-400 text-center">还没有保存的曲谱</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {songs.map((song) => (
                <li key={song.id} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800 truncate">
                      {song.analysis.title || "未命名曲谱"}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {song.analysis.key && <span className="mr-2">{song.analysis.key}</span>}
                      <span>保存于 {formatDate(song.savedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { onLoad(song.analysis); setOpen(false); }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0"
                  >
                    加载
                  </button>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="text-stone-400 hover:text-red-500 text-sm transition-colors shrink-0"
                    title="删除"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
