import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/data-sensors": "Data Sensors",
  "/action-history": "Action History",
  "/profile": "Profile",
};

export function Shell({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <div className="flex h-screen w-full flex-col bg-[#F4F6F8]">
      <div className="flex min-h-0 flex-1 lg:flex-row">
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200 lg:grid-cols-[300px_1fr]">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-zinc-200 bg-white px-8 py-6 outline-none select-none">
              <div className="text-4xl font-bold tracking-tight text-zinc-900 lg:text-5xl outline-none select-none">
                {title}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 pb-24 lg:p-10 lg:pb-10">{children}</div>
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
