"use client";

interface AppHeaderProps {
  emoji?: string; // kept for backwards compat, unused
  title: string;
  subtitle: string;
  extra?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, extra }: AppHeaderProps) {
  return (
    <header className="h-[72px] flex items-center justify-between px-4 md:px-10 border-b border-[#E5DFD6] shrink-0 bg-white">
      <div>
        <h1 className="text-xl font-bold text-[#1C1917] tracking-tight font-[family-name:var(--font-space-grotesk)]">
          {title}
        </h1>
        <p className="text-xs text-[#78716C] mt-0.5">{subtitle}</p>
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </header>
  );
}
