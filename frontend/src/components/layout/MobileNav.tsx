"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Database, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  { key: "sensors", label: "Data Sensors", icon: Database, href: "/data-sensors" },
  { key: "history", label: "Action History", icon: History, href: "/action-history" },
  { key: "profile", label: "Profile", icon: User, href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(560px,calc(100%-32px))] rounded-2xl border-2 border-zinc-200 bg-white/95 backdrop-blur shadow-lg">
      <div className="grid grid-cols-4 gap-2 p-3">
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          const isActive = pathname === n.href;
          return (
            <Link
              key={n.key}
              href={n.href}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-semibold select-none outline-none focus:outline-none",
                isActive ? "bg-[#27A6E5] text-white" : "text-zinc-600 hover:bg-zinc-50"
              )}
            >
              <Icon size={22} />
              {n.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
