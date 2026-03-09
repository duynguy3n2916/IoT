"use client";

import { cn } from "@/lib/utils";

export function DeviceTile({
  icon,
  title,
  state,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  state: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-600 lg:text-base">{title.toUpperCase()}</div>
          </div>
        </div>
        <div className={cn(
          "text-sm font-semibold lg:text-base",
          state ? "text-emerald-600" : "text-red-600"
        )}>{state ? "ON" : "OFF"}</div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-zinc-500">Toggle</div>
        <button
          type="button"
          onClick={() => onToggle(!state)}
          className={cn(
            "relative flex h-8 w-14 shrink-0 items-center overflow-hidden rounded-full border transition select-none cursor-default",
            "focus:outline-none focus:ring-0 active:outline-none",
            state ? "bg-emerald-500 border-emerald-500" : "bg-zinc-200 border-zinc-200",
            "lg:h-9 lg:w-16"
          )}
          aria-pressed={state}
        >
          <span
            className={cn(
              "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform",
              "lg:h-6 lg:w-6",
              state ? "left-[28px] lg:left-[34px]" : "left-1.5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
