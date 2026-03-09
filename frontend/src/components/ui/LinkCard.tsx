export function LinkCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-5 py-4 text-left hover:bg-zinc-50">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-2 ring-zinc-200">
          {icon}
        </div>
        <div className="text-base font-bold text-zinc-900 lg:text-lg">{label}</div>
      </div>
    </button>
  );
}
