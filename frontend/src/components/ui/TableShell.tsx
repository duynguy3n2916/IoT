import { cn } from "@/lib/utils";

export function TableShell({
  headers,
  children,
  colSpans,
  centerHeaderIndices = [],
  footer,
}: {
  headers: string[];
  children: React.ReactNode;
  colSpans?: number[];
  centerHeaderIndices?: number[];
  footer?: React.ReactNode;
}) {
  const spans = colSpans ?? headers.map((_, i) =>
    i === 0 ? 1 : i === headers.length - 1 ? 3 : 2
  );

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white">
      <div className="bg-gradient-to-r from-[#2C86A5] via-[#1F6E8C] to-[#0F3F57] text-white">
        <div className="grid grid-cols-12 gap-2 px-6 py-4 text-sm font-semibold lg:text-base">
          {headers.map((h, i) => (
            <div
              key={i}
              className={cn(
                spans[i] === 1 && "col-span-1",
                spans[i] === 2 && "col-span-2",
                spans[i] === 3 && "col-span-3",
                spans[i] === 4 && "col-span-4",
                spans[i] === 5 && "col-span-5",
                spans[i] === 6 && "col-span-6",
                centerHeaderIndices.includes(i) && "flex justify-center"
              )}
            >
              {h}
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-zinc-100 bg-gradient-to-b from-white via-[#F8FBFD] to-white">
        {children}
      </div>
      {footer && (
        <div className="flex items-center justify-end gap-3 px-6 py-4 text-sm text-zinc-600">
          {footer}
        </div>
      )}
    </div>
  );
}
