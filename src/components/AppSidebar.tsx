"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/",        icon: "🏠", label: "首页"       },
  { href: "/path",    icon: "🗺️", label: "学习路径"   },
  { href: "/backing", icon: "🎼", label: "伴奏练习"   },
  { href: "/scales",  icon: "🎵", label: "音阶练习"   },
  { href: "/caged",   icon: "🎸", label: "CAGED 指型" },
  { href: "/theory",  icon: "📖", label: "乐理知识"   },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-[220px] h-full bg-[#141414] flex-col shrink-0 border-r border-[#1E1E1E]">
      {/* Logo */}
      <div className="h-[72px] flex items-center gap-3 px-6 border-b border-[#222222] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center text-white font-bold text-lg shrink-0">
          ♪
        </div>
        <div>
          <p className="text-sm font-bold text-[#F5F0EB] tracking-wide font-[family-name:var(--font-space-grotesk)]">
            GuitarAI
          </p>
          <p className="text-[10px] text-[#6B7280]">学习助手</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-2.5 h-11 px-3 rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#1E1E1E] text-[#F97316] ring-1 ring-[#F97316]/60"
                  : "text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1A1A1A]"
              }`}
            >
              <span className="text-[15px] w-5 flex-shrink-0">{item.icon}</span>
              <span className="font-[family-name:var(--font-space-grotesk)]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
