"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const THEME = {
  red: {
    color: "#E00000",
    stroke: "#E00000",
    gradient: { from: "#FF0000", to: "#FFFFFF" },
    titleClass: "text-[#E00000]",
    borderClass: "border-[#E00000]",
  },
  blue: {
    color: "#007BA7",
    stroke: "#007BA7",
    gradient: { from: "#007BA7", to: "#FFFFFF" },
    titleClass: "text-[#007BA7]",
    borderClass: "border-[#007BA7]",
  },
  amber: {
    color: "#FF8C00",
    stroke: "#FF8C00",
    gradient: { from: "#FFA500", to: "#FFFFFF" },
    titleClass: "text-[#FF8C00]",
    borderClass: "border-[#FF8C00]",
  },
} as const;

export function MiniChart({
  label,
  colorTone,
  dataKey,
  data,
}: {
  label: string;
  colorTone: "red" | "blue" | "amber";
  dataKey: "temp" | "hum" | "lux";
  data: Array<Record<string, number>>;
}) {
  const theme = THEME[colorTone];
  const gradientId = `g-${colorTone}-${dataKey}`;
  const unitMap: Record<typeof dataKey, string> = { temp: "°C", hum: "%", lux: "lx" };
  const valueLabelMap: Record<typeof dataKey, string> = { temp: "Nhiệt độ", hum: "Độ ẩm", lux: "Ánh sáng" };

  const formatTime = (ts?: number) => {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "-";
    }
  };

  return (
    <div className={cn("rounded-2xl border-2 bg-white p-5", theme.borderClass)}>
      <div className={cn("text-sm font-extrabold uppercase lg:text-base", theme.titleClass)}>
        {label}
      </div>
      <div className="mt-4 h-48 lg:h-56">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">Chờ dữ liệu...</div>
        ) : (
          <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 12, left: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.gradient.from} stopOpacity={1} />
                    <stop offset="100%" stopColor={theme.gradient.to} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="t"
                  hide
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  padding={{ left: 0, right: 0 }}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const p = payload[0]?.payload as Record<string, number> | undefined;
                    if (!p) return null;

                    const value = p[dataKey];
                    const ts = p.ts;

                    const formattedValue =
                      dataKey === "temp" ? Number(value).toFixed(1) : Math.round(Number(value)).toString();
                    return (
                      <div className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-800 shadow-sm">
                        <div className="font-semibold">Thời gian: {formatTime(ts)}</div>
                        <div>
                          {valueLabelMap[dataKey]}: {formattedValue} {unitMap[dataKey]}
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="linear"
                  dataKey={dataKey}
                  stroke={theme.stroke}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
