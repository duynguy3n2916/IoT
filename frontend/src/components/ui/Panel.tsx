export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <div className="px-4 pt-4 text-sm font-bold text-zinc-900">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
