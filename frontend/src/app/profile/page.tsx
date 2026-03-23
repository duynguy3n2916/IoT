import { Figma, Github, FileCode2, FileText } from "lucide-react";

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
          <a
            href="https://www.figma.com/design/4isBXQC4C1NAMd3NQtHzk3/IoT?node-id=0-1&p=f&t=FMMmVRKi0OCeeCKM-0"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl border-2 border-zinc-200 bg-white px-5 py-4 text-left hover:bg-zinc-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-2 ring-zinc-200">
                <Figma size={22} className="text-zinc-900" />
              </div>
              <div className="text-base font-bold text-zinc-900 lg:text-lg">Figma</div>
            </div>
          </a>
          <a
            href="https://github.com/duynguy3n2916/IoT"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl border-2 border-zinc-200 bg-white px-5 py-4 text-left hover:bg-zinc-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-2 ring-zinc-200">
                <Github size={22} className="text-zinc-900" />
              </div>
              <div className="text-base font-bold text-zinc-900 lg:text-lg">Github</div>
            </div>
          </a>
          <a
            href="https://docs.google.com/document/d/1Nh3KfikOe8oDApx-E_TYDO_7oq9KVhtzDI_w4weAwrw/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl border-2 border-zinc-200 bg-white px-5 py-4 text-left hover:bg-zinc-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-2 ring-zinc-200">
                <FileText size={22} className="text-zinc-900" />
              </div>
              <div className="text-base font-bold text-zinc-900 lg:text-lg">PDF</div>
            </div>
          </a>
          <a
            href="https://bipbeo123456-5548511.postman.co/workspace/817dd4fa-fcc0-42e8-86e9-05829493dc72/documentation/53338086-8d48f2e1-152d-469d-aabf-54b0da46a0d2"
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl border-2 border-zinc-200 bg-white px-5 py-4 text-left hover:bg-zinc-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-2 ring-zinc-200">
                <FileCode2 size={22} className="text-zinc-900" />
              </div>
              <div className="text-base font-bold text-zinc-900 lg:text-lg">API Docs</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
