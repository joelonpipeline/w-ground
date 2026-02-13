"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/matches", label: "매치 목록", icon: "⚽" },
  { href: "/admin/ingest", label: "매치 등록", icon: "📝" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="text-xl">⚽</span>
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent text-lg">
            W-Ground
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={item.href}>
                <span className="mr-1 hidden sm:inline">{item.icon}</span>
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
