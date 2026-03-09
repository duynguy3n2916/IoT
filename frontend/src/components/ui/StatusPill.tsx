import { cn } from "@/lib/utils";

export function StatusPill({ value }: { value: "ON" | "OFF" | "WAITING" | "SUCCESS" | "FAILED" }) {
  const colors = {
    ON: { bg: "bg-emerald-100", text: "#059669" },
    OFF: { bg: "bg-red-100", text: "#dc2626" },
    WAITING: { bg: "bg-amber-100", text: "#b45309" },
    SUCCESS: { bg: "bg-emerald-100", text: "#047857" },
    FAILED: { bg: "bg-rose-100", text: "#be123c" },
  };
  const c = colors[value];
  return (
    <span
      className={cn("inline-flex rounded-full px-4 py-1.5 text-sm font-bold", c.bg)}
      style={{ color: c.text }}
    >
      {value}
    </span>
  );
}
