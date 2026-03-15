import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppSidebar from "@/components/AppSidebar";
import AppBottomNav from "@/components/AppBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GuitarAI · 吉他学习助手",
  description: "AI 六线谱识别与分析",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GuitarAI",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden bg-[#F5F2ED]">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col pb-16 md:pb-0">
              {children}
            </div>
            <AppBottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
