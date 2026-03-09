import { Link as LinkIcon, Github, FileText } from "lucide-react";
import { LinkCard } from "@/components/ui";

export default function ProfilePage() {
  return (
    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-[#1E40AF] ring-2 ring-zinc-200 lg:h-28 lg:w-28">
            <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white lg:text-3xl">ND</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-zinc-900 lg:text-3xl">Nguyen Thanh Duy</div>
            <div className="mt-1 text-base font-semibold text-zinc-600 lg:text-lg">B22DCPT040</div>
          </div>
        </div>
        <div className="md:ml-auto w-full md:max-w-lg space-y-4">
          <LinkCard icon={<LinkIcon size={22} />} label="Figma" />
          <LinkCard icon={<Github size={22} />} label="Github" />
          <LinkCard icon={<FileText size={22} />} label="PDF" />
        </div>
      </div>
    </div>
  );
}
