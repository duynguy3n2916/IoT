import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  unit,
  tone,
  icon,
}: {
  title: string;
  value: string;
  unit: string;
  tone: "red" | "blue" | "amber";
  icon: React.ReactNode;
}) {
  const cls =
    tone === "red"
      ? "bg-[#FFD7D7] border-2 border-[#E00000]"
      : tone === "blue"
        ? "bg-[#CFEFFF] border-2 border-[#007BA7]"
        : "bg-[#FFE7BF] border-2 border-[#FF8C00]";
  const text =
    tone === "red"
      ? "text-[#E00000]"
      : tone === "blue"
        ? "text-[#007BA7]"
        : "text-[#FF8C00]";

  return (
    <div className={cn("flex items-center gap-6 rounded-2xl p-6", cls)}>
      <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/60", text)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-base font-semibold text-zinc-700">{title}</div>
        <div className={cn("mt-2 text-3xl font-extrabold lg:text-4xl", text)}>
          {value}
          <span className="ml-2 text-lg font-bold opacity-80">{unit}</span>
        </div>
      </div>
    </div>
  );
}
