"use client";

import { useState } from "react";

interface PlayButtonProps {
  onPlay: () => void;
  size?: "sm" | "md";
  className?: string;
  title?: string;
}

export default function PlayButton({ onPlay, size = "sm", className = "", title = "播放" }: PlayButtonProps) {
  const [playing, setPlaying] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay();
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1600);
  };

  return (
    <button
      onClick={handleClick}
      title={title}
      className={`inline-flex items-center justify-center rounded-full transition-all select-none
        ${size === "sm" ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-sm"}
        ${playing
          ? "bg-[#F97316] text-white scale-110 shadow-md"
          : "bg-[#F0EDE8] text-[#78716C] hover:bg-[#F97316]/20 hover:text-[#F97316]"
        } ${className}`}
    >
      {playing ? "♪" : "▶"}
    </button>
  );
}
