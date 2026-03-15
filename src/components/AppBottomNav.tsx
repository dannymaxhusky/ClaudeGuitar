"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./AppSidebar";

export default function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#141414] border-t border-[#1E1E1E] flex z-50">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? "text-[#F97316]" : "text-[#6B7280]"
            }`}
          >
            <span className="text-[20px] leading-none">{item.icon}</span>
            <span className="text-[9px] font-medium font-[family-name:var(--font-space-grotesk)] leading-none mt-0.5">
              {item.label.replace(" 指型", "").replace("学习", "")}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
