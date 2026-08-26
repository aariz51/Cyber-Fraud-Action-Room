"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, ClipboardText, Gavel, Question, Trash } from "@phosphor-icons/react";
import { StageMachine } from "@/components/ActionPanels";
import { useCase } from "@/lib/store";
import { formatINR } from "@/lib/recovery";
import { PORTAL_STATUS, statutoryStatus } from "@/lib/case";

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

          {/* The second clock. The recovery curve says how fast the money moves;
              this says how fast the citizen's rights expire. */}
          <section className="glass-panel p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-[var(--accent)]"><Gavel size={18} weight="fill" /><span className="eyebrow">The other clock</span></div>
            <h2 className="mt-3 text-lg font-semibold tracking-tight">Deadlines that expire whether or not anyone tells you</h2>
            <p className="mt-2 max-w-[52rem] text-[0.82rem] leading-6 text-[var(--ink-3)]">Day {Math.floor(elapsedMin / 1440)} since the incident. Each of these is a published rule with a date attached, and none of them appear on any portal you can log into.</p>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {statutoryStatus(Math.floor(elapsedMin / 1440)).map((d) => (
                <li key={d.id} className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="num text-[0.72rem] font-bold" style={{ color: d.state === "passed" ? "var(--crit)" : d.state === "today" ? "var(--warn)" : "var(--ink-4)" }}>DAY {d.day}</span>
                    <span className="text-[0.66rem] font-bold uppercase tracking-wider" style={{ color: d.state === "passed" ? "var(--crit)" : "var(--ink-4)" }}>
                      {d.state === "passed" ? "passed" : d.state === "today" ? "today" : `in ${d.daysAway}d`}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[0.86rem] font-semibold leading-snug">{d.title}</h3>
                  <p className="mt-1.5 text-[0.76rem] leading-5 text-[var(--ink-3)]">{d.what}</p>
                  <p className="mt-2 text-[0.7rem] leading-4 text-[var(--ink-4)]">{d.authority}</p>
                  {d.state === "passed" && (<p className="mt-2 border-t border-[var(--line)] pt-2 text-[0.76rem] leading-5" style={{ color: "var(--ink-2)" }}><strong>Now: </strong>{d.ifMissed}</p>)}
                </li>
              ))}
            </ol>
          </section>

          {/* "Disposed" is the most misread word in Indian cyber-fraud reporting. */}
          <section className="glass-panel p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-[var(--accent)]"><Question size={18} weight="fill" /><span className="eyebrow">Status decoder</span></div>
            <h2 className="mt-3 text-lg font-semibold tracking-tight">What the portal word actually means</h2>
            <p className="mt-2 max-w-[52rem] text-[0.82rem] leading-6 text-[var(--ink-3)]">People stop chasing when they read <strong style={{ color: "var(--ink)" }}>Disposed</strong>, because it sounds like it is over. It is the point to start chasing.</p>
            <div className="mt-5 grid gap-px overflow-hidden rounded-[1rem] border border-[var(--line)] bg-[var(--line)]">
              {PORTAL_STATUS.map((s2) => (
                <article key={s2.label} className="bg-[var(--surface-2)] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num text-[0.82rem] font-bold">{s2.label}</span>
                    <span className="chip !px-2 !py-0.5 !text-[0.6rem]" style={{ background: s2.good ? "var(--ok-soft)" : "var(--warn-soft)", color: s2.good ? "var(--ok)" : "var(--warn)" }}>{s2.good ? "genuinely progress" : "not what it sounds like"}</span>
                  </div>
                  <p className="mt-2 text-[0.74rem] italic leading-5 text-[var(--ink-4)]">{s2.reads}</p>
                  <p className="mt-1.5 text-[0.8rem] leading-6 text-[var(--ink-2)]">{s2.means}</p>
                  <p className="mt-2 text-[0.78rem] leading-5"><strong style={{ color: "var(--accent-text)" }}>Do now: </strong><span className="text-[var(--ink-3)]">{s2.doNow}</span></p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
