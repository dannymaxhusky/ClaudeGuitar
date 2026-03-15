"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

interface Track {
  id: string;
  name: string;
  url: string;
  key: string;
  bpm: string;
  progression: string;
}

const KEYS = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];
const PROGRESSIONS = ["1625", "251", "145", "12小节蓝调", "Rhythm Changes", "自由即兴", "其他"];

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function BackingPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loop, setLoop] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks.find((t) => t.id === currentId) ?? null;

  // Sync audio element with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.loop = loop;
  }, [volume, loop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack) {
      audio.src = currentTrack.url;
      audio.load();
      if (playing) audio.play().catch(() => {});
    } else {
      audio.src = "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, []);

  const onEnded = useCallback(() => {
    if (!loop) setPlaying(false);
  }, [loop]);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("audio/"));
    if (arr.length === 0) return;
    const newTracks: Track[] = arr.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name.replace(/\.\w+$/, ""),
      url: URL.createObjectURL(f),
      key: "C",
      bpm: "",
      progression: "",
    }));
    setTracks((prev) => [...prev, ...newTracks]);
  }

  function removeTrack(id: string) {
    const track = tracks.find((t) => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    if (currentId === id) {
      setCurrentId(null);
      setPlaying(false);
    }
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTrack(id: string, patch: Partial<Track>) {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function playTrack(id: string) {
    if (currentId === id) {
      setPlaying((p) => !p);
    } else {
      setCurrentId(id);
      setPlaying(true);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />

      {/* Header */}
      <AppHeader title="伴奏练习中心" subtitle="上传伴奏音轨，配合音阶/和弦练习即兴" />

      <main className="flex-1 overflow-auto px-4 md:px-10 py-8 space-y-6">
        {/* Player */}
        {currentTrack && (
          <div className="bg-[#F0EDE8] rounded-xl p-5 shadow-lg text-[#1C1917]">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{currentTrack.name}</p>
                <div className="flex gap-3 mt-1">
                  {currentTrack.key && (
                    <span className="text-xs text-[#78716C]">🎵 {currentTrack.key}</span>
                  )}
                  {currentTrack.bpm && (
                    <span className="text-xs text-[#78716C]">♩ {currentTrack.bpm} BPM</span>
                  )}
                  {currentTrack.progression && (
                    <span className="text-xs text-[#78716C]">🎼 {currentTrack.progression}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setLoop((l) => !l)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    loop ? "bg-[#F97316] text-white" : "bg-[#E5DFD6] text-[#78716C] hover:bg-[#C8C2BA]"
                  }`}
                >
                  🔁 循环
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={seek}
              className="w-full h-1.5 accent-[#F97316] cursor-pointer mb-1"
            />
            <div className="flex justify-between text-xs text-[#78716C] mb-3">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="w-12 h-12 rounded-full bg-[#F97316] hover:bg-[#EA6B0A] flex items-center justify-center transition-colors shadow-lg"
              >
                {playing ? (
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[#78716C] text-sm">🔊</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-[#F97316] cursor-pointer"
                />
                <span className="text-xs text-[#78716C] w-8">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-[#F97316] bg-[#F97316]/10"
              : "border-[#E5DFD6] hover:border-[#C8C2BA] bg-white"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
          />
          <div className="text-3xl mb-2">🎼</div>
          <p className="text-[#57534E] font-medium">
            {tracks.length > 0 ? "点击或拖拽追加音轨" : "拖拽或点击上传伴奏音轨"}
          </p>
          <p className="text-sm text-[#78716C] mt-1">支持 MP3、WAV、M4A、OGG 等音频格式</p>
        </div>

        {/* Track list */}
        {tracks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#57534E] font-[family-name:var(--font-space-grotesk)]">音轨列表 ({tracks.length})</h2>
            {tracks.map((track) => {
              const isActive = currentId === track.id;
              const isEditing = editingId === track.id;

              return (
                <div
                  key={track.id}
                  className={`bg-white rounded-xl border transition-all ${
                    isActive ? "border-[#F97316]/40 ring-1 ring-[#F97316]/20" : "border-[#E5DFD6]"
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Play button */}
                    <button
                      onClick={() => playTrack(track.id)}
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isActive && playing
                          ? "bg-[#F97316] text-white"
                          : "bg-[#F0EDE8] text-[#57534E] hover:bg-[#E5DFD6]"
                      }`}
                    >
                      {isActive && playing ? (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isActive ? "text-[#F97316]" : "text-[#1C1917]"}`}>
                        {track.name}
                      </p>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {track.key && (
                          <span className="text-xs text-[#78716C]">🎵 {track.key}</span>
                        )}
                        {track.bpm && (
                          <span className="text-xs text-[#78716C]">♩ {track.bpm} BPM</span>
                        )}
                        {track.progression && (
                          <span className="text-xs text-[#78716C]">🎼 {track.progression}</span>
                        )}
                      </div>
                    </div>

                    {/* Edit / delete */}
                    <button
                      onClick={() => setEditingId(isEditing ? null : track.id)}
                      className="flex-shrink-0 px-2 py-1 rounded text-xs text-[#78716C] hover:bg-[#F0EDE8] transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="flex-shrink-0 px-2 py-1 rounded text-xs text-[#78716C] hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Edit panel */}
                  {isEditing && (
                    <div className="border-t border-[#E5DFD6] p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-[#78716C] block mb-1 font-[family-name:var(--font-space-grotesk)]">曲名</label>
                        <input
                          value={track.name}
                          onChange={(e) => updateTrack(track.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-[#E5DFD6] rounded-lg focus:outline-none focus:border-[#F97316] bg-[#F0EDE8] text-[#1C1917]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#78716C] block mb-1 font-[family-name:var(--font-space-grotesk)]">调性</label>
                        <select
                          value={track.key}
                          onChange={(e) => updateTrack(track.id, { key: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-[#E5DFD6] rounded-lg focus:outline-none focus:border-[#F97316] bg-[#F0EDE8] text-[#1C1917]"
                        >
                          <option value="">—</option>
                          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[#78716C] block mb-1 font-[family-name:var(--font-space-grotesk)]">BPM</label>
                        <input
                          type="number"
                          placeholder="120"
                          value={track.bpm}
                          onChange={(e) => updateTrack(track.id, { bpm: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-[#E5DFD6] rounded-lg focus:outline-none focus:border-[#F97316] bg-[#F0EDE8] text-[#1C1917]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#78716C] block mb-1 font-[family-name:var(--font-space-grotesk)]">和弦进行</label>
                        <select
                          value={track.progression}
                          onChange={(e) => updateTrack(track.id, { progression: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-[#E5DFD6] rounded-lg focus:outline-none focus:border-[#F97316] bg-[#F0EDE8] text-[#1C1917]"
                        >
                          <option value="">—</option>
                          {PROGRESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Practice tips */}
        <div className="bg-gradient-to-br from-emerald-950 to-teal-950 rounded-xl border border-emerald-900/40 p-5">
          <h3 className="font-semibold text-emerald-400 mb-3">🎯 伴奏练习建议</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { n: "1", tip: "先用慢速伴奏（60-80 BPM）建立肌肉记忆，再逐步提速" },
              { n: "2", tip: "只用根音和五度音开始，确保每个音都落在和弦的强拍上" },
              { n: "3", tip: "录下自己的即兴，回听找出「卡顿」和「游离」的地方" },
              { n: "4", tip: "一次只专注一件事：要么练音准，要么练节奏，不要同时兼顾" },
              { n: "5", tip: "12小节蓝调是最好的即兴训练场，先熟悉结构再加入装饰音" },
              { n: "6", tip: "结合音阶练习器，弄清楚伴奏的调性后选对应音阶即兴" },
            ].map(({ n, tip }) => (
              <div key={n} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-900 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {n}
                </span>
                <p className="text-sm text-emerald-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick reference */}
        <div className="bg-white rounded-xl border border-[#E5DFD6] p-4">
          <h3 className="text-sm font-semibold text-[#57534E] mb-3 font-[family-name:var(--font-space-grotesk)]">📋 常见进行对应音阶速查</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#57534E] border-collapse">
              <thead>
                <tr className="border-b border-[#E5DFD6]">
                  <th className="text-left py-2 pr-4 font-semibold text-[#1C1917]">和弦进行</th>
                  <th className="text-left py-2 pr-4 font-semibold text-[#1C1917]">推荐音阶</th>
                  <th className="text-left py-2 font-semibold text-[#1C1917]">备注</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { prog: "12小节蓝调", scale: "小调五声 / 布鲁斯", note: "最经典的即兴场景" },
                  { prog: "1-6-4-5 (1625)", scale: "大调音阶 / 大调五声", note: "流行/民谣万用" },
                  { prog: "2-5-1 (251)", scale: "Dorian → Mixolydian → Ionian", note: "爵士标配，跟随和弦换调式" },
                  { prog: "1-4-5 (145)", scale: "大调五声 / Mixolydian", note: "摇滚/乡村" },
                  { prog: "i-VII-VI-VII", scale: "自然小调 / Dorian", note: "流行小调进行" },
                  { prog: "i-iv-V (小调251)", scale: "和声小调", note: "V 和弦用和声小调增加张力" },
                ].map((row) => (
                  <tr key={row.prog} className="border-b border-[#E5DFD6] hover:bg-[#F0EDE8]">
                    <td className="py-2 pr-4 font-mono font-medium text-[#F97316]">{row.prog}</td>
                    <td className="py-2 pr-4">
                      <Link href="/scales" className="text-[#F97316] hover:underline">{row.scale}</Link>
                    </td>
                    <td className="py-2 text-[#78716C]">{row.note}</td>
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
