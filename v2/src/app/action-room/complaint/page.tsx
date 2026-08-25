"use client";

import Link from "next/link";
import { ArrowRight, FileText, Info, Sparkle } from "@phosphor-icons/react";
import { BankNotice } from "@/components/ActionPanels";
import { ComplaintDraft } from "@/components/ComplaintDraft";
import { useCase } from "@/lib/store";

export default function ComplaintPage() {
  const { kase, elapsedMin, update } = useCase();

  return (
    <main className="app-page">
      <header className="max-w-3xl"><p className="eyebrow">OpenAI-assisted chronology</p><h1 className="display mt-3 text-[2.9rem] leading-none sm:text-[4rem]">Complaint draft</h1><p className="mt-4 text-sm leading-7 text-[var(--ink-3)]">Describe what happened in your own order. The model’s only job is to structure it into a factual chronology. Routing, legal guidance, and urgent actions remain deterministic.</p></header>

      {!kase ? (
        <section className="glass-panel mt-8 max-w-3xl p-6 sm:p-8"><FileText size={24} weight="duotone" color="var(--accent)" /><h2 className="mt-5 text-xl font-semibold">Create a local case first</h2><p className="mt-3 text-sm leading-7 text-[var(--ink-3)]">The amount, payment route, time, and authorisation answer are needed to produce an accurate draft without inventing details.</p><Link href="/action-room/intake" className="btn btn-primary mt-6 px-5 py-3 text-sm">Start four-question triage<ArrowRight size={16} /></Link></section>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <section className="glass-panel p-5 sm:p-6" aria-labelledby="complaint-generator"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4"><span className="flex items-center gap-2"><Sparkle size={18} weight="duotone" color="var(--accent)" /><h2 id="complaint-generator" className="text-sm font-bold">Chronology generator</h2></span><span className="chip bg-[var(--accent-soft)] text-[var(--accent)]">MODEL + FALLBACK</span></div><div className="mt-5"><ComplaintDraft kase={kase} elapsedMin={elapsedMin} onNarrative={(narrative) => update({ narrative })} /></div></section>
          <aside className="space-y-4">
            <section className="panel p-5"><h2 className="text-sm font-bold">Written bank notice</h2><div className="mt-4"><BankNotice kase={kase} /></div></section>
            <div className="panel p-5"><div className="flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" /><p className="text-[0.74rem] leading-6 text-[var(--ink-3)]">Only the narrative is sent to the server when you press the generation button. Never enter OTPs, PINs, passwords, Aadhaar, PAN, or full card details.</p></div></div>
          </aside>
        </div>
      )}
    </main>
  );
}
