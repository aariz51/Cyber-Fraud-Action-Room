"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, ClipboardText, Trash } from "@phosphor-icons/react";
import { StageMachine } from "@/components/ActionPanels";
import { useCase } from "@/lib/store";
import { formatINR } from "@/lib/recovery";

export default function RecoveryPage() {
  const { kase, elapsedMin, clear } = useCase();

  return (
    <main className="app-page">
      <header className="max-w-3xl"><p className="eyebrow">After reporting</p><h1 className="display mt-3 text-[2.9rem] leading-none sm:text-[4rem]">Recovery tracker</h1><p className="mt-4 text-sm leading-7 text-[var(--ink-3)]">See what has been logged, what stage is simulated next, and where follow-up becomes necessary. This does not connect to any live government or bank status.</p></header>

      {!kase ? (
        <section className="glass-panel mt-8 max-w-3xl p-6 sm:p-8"><ClipboardText size={24} weight="duotone" color="var(--accent)" /><h2 className="mt-5 text-xl font-semibold">No local case to track</h2><p className="mt-3 text-sm leading-7 text-[var(--ink-3)]">Complete triage, then mark urgent actions as done. The stage view responds to those local actions.</p><Link href="/action-room/intake" className="btn btn-primary mt-6 px-5 py-3 text-sm">Start triage<ArrowRight size={16} /></Link></section>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_18rem]">
          <StageMachine elapsedMin={elapsedMin} done={kase.done} />
          <aside className="space-y-4">
            <div className="glass-panel p-5"><div className="flex items-center gap-2 text-[var(--accent)]"><CheckCircle size={18} weight="fill" /><span className="eyebrow">Local record</span></div><p className="num mt-4 text-lg">{kase.id}</p><dl className="mt-4 space-y-3 border-t border-[var(--line)] pt-4 text-xs"><div className="flex justify-between gap-4"><dt className="text-[var(--ink-4)]">Amount</dt><dd>{formatINR(kase.amount)}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--ink-4)]">Actions</dt><dd>{kase.done.length} / 5</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--ink-4)]">Acknowledgement</dt><dd className="num text-right">{kase.ackNumber ?? "Not logged"}</dd></div></dl><Link href="/action-room/case" className="btn btn-primary mt-5 w-full px-4 py-3 text-sm">Update action room<ArrowRight size={15} /></Link></div>
            <button type="button" onClick={clear} className="btn btn-secondary w-full px-4 py-3 text-sm"><Trash size={15} />Erase local case</button>
          </aside>
        </div>
      )}
    </main>
  );
}
