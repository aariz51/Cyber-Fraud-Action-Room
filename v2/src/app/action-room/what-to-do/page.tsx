"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, ClockCountdown, FileText, FolderOpen, PhoneCall } from "@phosphor-icons/react";
import { useCase } from "@/lib/store";
import { prioritisedActions } from "@/lib/case";

const FALLBACK = [
  { title: "Call 1930", detail: "Ask for a freeze request to the beneficiary bank and an acknowledgement number.", href: "tel:1930", external: true, icon: PhoneCall },
  { title: "Notify your bank in writing", detail: "A written timestamp preserves the liability and escalation record.", href: "/action-room/complaint", icon: FileText },
  { title: "Preserve evidence", detail: "Save the transaction reference, bank alert, full chat, numbers, IDs, and links.", href: "/action-room/evidence", icon: FolderOpen },
] as const;

export default function WhatToDoPage() {
  const { kase, elapsedMin } = useCase();
  const actions = kase ? prioritisedActions({ amount: kase.amount, route: kase.route, consent: kase.consent, elapsedMin }) : [];

  return (
    <main className="app-page">
      <header className="max-w-3xl">
        <p className="eyebrow">Urgent workflow</p>
        <h1 className="display mt-3 text-[2.9rem] leading-none sm:text-[4rem]">What to do now</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-3)]">Actions live here on their own page, ordered for a stressful first session. Reporting quickly supports containment; this prototype does not predict personal recovery.</p>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2"><ClockCountdown size={18} weight="duotone" color="var(--accent)" /><h2 className="text-sm font-bold">Priority sequence</h2></div>
            <span className="chip bg-[var(--accent-soft)] text-[var(--accent)]">REPORT NOW</span>
          </div>

          {kase ? (
            <ol>
              {actions.map((action, i) => {
                const done = kase.done.includes(action.id);
                const href = action.id === "call1930" ? "tel:1930" : action.id === "evidence" ? "/action-room/evidence" : action.id === "freeze" ? "/action-room/complaint" : "/action-room/case";
                return (
                  <li key={action.id} className="grid gap-3 border-b border-[var(--line)] p-5 last:border-0 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6">
                    <span className={`num grid h-8 w-8 place-items-center rounded-full border ${done ? "border-[var(--ok)] bg-[var(--ok-soft)] text-[var(--ok)]" : "border-[var(--line-strong)] text-[var(--accent)]"}`}>{done ? <CheckCircle size={17} weight="fill" /> : i + 1}</span>
                    <div><h3 className="text-sm font-bold">{action.title}</h3><p className="mt-1 text-[0.76rem] leading-5 text-[var(--ink-3)]">{action.why}</p></div>
                    <Link href={href} className="btn btn-secondary px-3 py-2 text-xs">{done ? "Review" : action.cta}<ArrowRight size={13} /></Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="p-5 sm:p-6">
              <p className="text-sm leading-6 text-[var(--ink-3)]">Start triage for a case-specific sequence. These three actions are safe defaults while you do that.</p>
              <ol className="mt-5 space-y-3">
                {FALLBACK.map((item, i) => { const Icon = item.icon; return (
                  <li key={item.title} className="task-card flex gap-4 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-3)] text-[var(--accent)]"><Icon size={19} weight="duotone" /></span><div className="min-w-0 flex-1"><p className="num text-[0.62rem] text-[var(--ink-4)]">0{i + 1}</p><h3 className="mt-1 text-sm font-bold">{item.title}</h3><p className="mt-1 text-[0.74rem] leading-5 text-[var(--ink-3)]">{item.detail}</p></div><Link href={item.href} className="self-center text-[var(--accent)]" aria-label={`Open ${item.title}`}><ArrowRight size={16} /></Link></li>
                ); })}
              </ol>
              <Link href="/action-room/intake" className="btn btn-primary mt-5 px-5 py-3 text-sm">Start case triage<ArrowRight size={16} /></Link>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="glass-panel p-5"><p className="eyebrow">Emergency call</p><h2 className="mt-3 text-lg font-semibold">Say the useful part first.</h2><p className="mt-2 text-[0.78rem] leading-6 text-[var(--ink-3)]">“I am reporting financial cyber fraud. Please raise the freeze request with the receiving bank now, and give me the acknowledgement number.”</p><a href="tel:1930" className="btn btn-primary mt-5 w-full px-4 py-3 text-sm"><PhoneCall size={16} weight="fill" />Call 1930</a></div>
          <div className="panel p-5"><h2 className="text-sm font-bold">Do not share</h2><p className="mt-2 text-[0.75rem] leading-6 text-[var(--ink-3)]">OTP, PIN, password, full card number, Aadhaar, PAN, or remote-access permissions. Golden Hour never asks for them.</p></div>
        </aside>
      </section>
    </main>
  );
}
