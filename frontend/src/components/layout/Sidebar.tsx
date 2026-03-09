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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="relative hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-[#0A2B3A] to-[#2C86A5]" />
      <div className="relative flex h-full flex-col p-6">
        <Link href="/dashboard" className="flex justify-center py-3 select-none outline-none focus:outline-none">
          <span className="text-lg font-semibold text-white/90">SmartHome</span>
        </Link>

        <div className="mt-12 space-y-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "block w-full rounded-xl px-4 py-3.5 text-left text-base font-medium transition select-none outline-none focus:outline-none",
                  isActive
                    ? "bg-[#27A6E5] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-lg",
                      isActive ? "bg-white/15" : "bg-white/10"
                    )}
                  >
                    <Icon size={24} />
                  </span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
