import { Search } from "lucide-react";

export function Toolbar({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-96">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          placeholder="Search"
          className="w-full rounded-xl border-2 border-zinc-200 bg-white py-3 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-[#27A6E5]"
        />
      </div>
      <div className="flex items-center gap-4">{right}</div>
    </div>
  );
}
