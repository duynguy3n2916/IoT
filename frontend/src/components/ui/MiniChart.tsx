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

  return (
    <div className={cn("rounded-2xl border-2 bg-white p-5", theme.borderClass)}>
      <div className={cn("text-sm font-extrabold uppercase lg:text-base", theme.titleClass)}>
        {label}
      </div>
      <div className="mt-4 h-48 lg:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.gradient.from} stopOpacity={1} />
                <stop offset="100%" stopColor={theme.gradient.to} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="t" hide />
            <YAxis hide />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={theme.stroke}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
