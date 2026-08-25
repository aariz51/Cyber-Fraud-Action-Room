import Link from "next/link";
import { ArrowRight, FileText, FolderOpen, Info } from "@phosphor-icons/react/dist/ssr";
import { EvidenceList } from "@/components/ActionPanels";

export default function EvidencePage() {
  return (
    <main className="app-page">
      <header className="max-w-3xl"><p className="eyebrow">Preserve before it disappears</p><h1 className="display mt-3 text-[2.9rem] leading-none sm:text-[4rem]">Evidence locker</h1><p className="mt-4 text-sm leading-7 text-[var(--ink-3)]">A guided checklist for the evidence most useful to a bank, helpline operator, or investigating officer. The prototype records only the checklist state in this session; it does not upload files.</p></header>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <section className="glass-panel p-5 sm:p-6" aria-labelledby="evidence-checklist"><div className="flex items-center gap-2 border-b border-[var(--line)] pb-4"><FolderOpen size={19} weight="duotone" color="var(--accent)" /><h2 id="evidence-checklist" className="text-sm font-bold">Capture checklist</h2></div><div className="mt-5"><EvidenceList /></div></section>
        <aside className="space-y-4">
          <div className="panel p-5"><div className="flex items-center gap-2 text-[var(--accent)]"><Info size={17} /><h2 className="text-sm font-bold text-[var(--ink)]">Safe capture rules</h2></div><ul className="mt-4 space-y-3 text-[0.76rem] leading-5 text-[var(--ink-3)]"><li>Preserve original timestamps and transaction references.</li><li>Capture the full conversation, not selected messages only.</li><li>Do not reopen suspicious links or reinstall apps.</li><li>Never place OTPs, PINs, or passwords in a complaint draft.</li></ul></div>
          <div className="glass-panel p-5"><FileText size={19} weight="duotone" color="var(--accent)" /><h2 className="mt-4 text-sm font-bold">Next: build the chronology</h2><p className="mt-2 text-[0.75rem] leading-5 text-[var(--ink-3)]">Use the evidence in time order. The drafting page can structure your rough account without changing the facts.</p><Link href="/action-room/complaint" className="btn btn-secondary mt-4 w-full px-4 py-3 text-sm">Open complaint draft<ArrowRight size={15} /></Link></div>
        </aside>
      </div>
    </main>
  );
}
