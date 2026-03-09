"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib";
import { Shell } from "./Shell";
import { MqttProvider } from "@/contexts/MqttProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const retryScheduleMs = [0, 2000, 5000, 8000];

    for (const delay of retryScheduleMs) {
      const timer = setTimeout(() => {
        void apiFetch("/api/devices/sync", { method: "POST" }).catch(() => {
          // Bỏ qua khi backend/MQTT hoặc phần cứng chưa sẵn sàng.
        });
      }, delay);
      timers.push(timer);
    }

    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <MqttProvider>
      <Shell pathname={pathname ?? "/dashboard"}>{children}</Shell>
    </MqttProvider>
  );
}
