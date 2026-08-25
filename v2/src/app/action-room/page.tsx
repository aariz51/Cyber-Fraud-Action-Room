"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ClockCountdown,
  FileText,
  FolderOpen,
  Path,
  PhoneCall,
  Snowflake,
  Trash,
} from "@phosphor-icons/react";
import { useCase } from "@/lib/store";
import { formatINR } from "@/lib/recovery";

const WORKSPACES = [
  { href: "/action-room/what-to-do", icon: ClockCountdown, label: "What to do now", detail: "The first actions, ordered for a live incident.", tone: "amber" },
  { href: "/action-room/money-trail", icon: Path, label: "Money trail", detail: "See the illustrative layer and containment model.", tone: "neutral" },
  { href: "/action-room/evidence", icon: FolderOpen, label: "Evidence locker", detail: "Capture the details that disappear first.", tone: "neutral" },
  { href: "/action-room/complaint", icon: FileText, label: "Complaint draft", detail: "Turn rough notes into a factual chronology.", tone: "neutral" },
  { href: "/action-room/recovery", icon: CheckCircle, label: "Recovery tracker", detail: "Track actions, references, and follow-ups.", tone: "neutral" },
  { href: "/action-room/frozen", icon: Snowflake, label: "Frozen account", detail: "A separate diagnostic and response path.", tone: "neutral" },
] as const;

export default function ActionRoomHome() {
  const { kase, clear, elapsedMin } = useCase();

  return (
    <main className="app-page">
      <div className="flex flex-col justify-between gap-6 border-b border-[var(--line)] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Guided command centre</p>
          <h1 className="display mt-3 text-[2.9rem] leading-none sm:text-[4rem]">Action Room</h1>
          <p className="mt-4 max-w-[42rem] text-sm leading-7 text-[var(--ink-3)]">
            Move through one focused workspace at a time. Your case stays on this device and can be erased whenever you choose.
          </p>
        </div>
        <span className="chip self-start border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)] sm:self-auto">DEMO CASE • SAVED LOCALLY</span>
      </div>

      {kase ? (
        <section className="glass-panel mt-7 overflow-hidden" aria-labelledby="active-case-heading">
          <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="status-dot" />
                <p className="eyebrow">Active local case</p>
                <span className="num text-[0.68rem] text-[var(--ink-4)]">{kase.id}</span>
              </div>
              <h2 id="active-case-heading" className="mt-3 text-xl font-semibold tracking-tight">
                {formatINR(kase.amount)} • {Math.floor(elapsedMin)} minutes since incident
              </h2>
              <p className="mt-2 text-sm text-[var(--ink-3)]">{kase.done.length} of 5 urgent actions logged</p>
            </div>
            <Link href="/action-room/case" className="btn btn-primary px-5 py-3 text-sm">Continue case <ArrowRight size={16} weight="bold" /></Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface-3)] px-5 py-3.5 text-xs text-[var(--ink-3)] sm:px-6">
            <span>No account • no database • local browser record</span>
            <button type="button" onClick={clear} className="btn btn-ghost !px-2 !py-1.5 text-xs"><Trash size={14} />Erase case</button>
          </div>
        </section>
      ) : (
        <section className="glass-panel mt-7 grid overflow-hidden lg:grid-cols-[1.2fr_.8fr]">
          <div className="p-6 sm:p-8">
            <span className="chip bg-[var(--accent-soft)] text-[var(--accent)]">REPORT NOW</span>
            <h2 className="display mt-5 max-w-[11ch] text-[2.5rem] leading-none sm:text-[3.2rem]">Has money just left your account?</h2>
            <p className="mt-4 max-w-[34rem] text-sm leading-7 text-[var(--ink-3)]">Four questions create a local case and route you to the actions that matter first.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/action-room/intake" className="btn btn-primary px-5 py-3.5 text-sm">Start four-question triage <ArrowRight size={16} weight="bold" /></Link>
              <a href="tel:1930" className="btn btn-secondary px-5 py-3.5 text-sm"><PhoneCall size={16} weight="fill" />Call 1930</a>
            </div>
          </div>
          <div className="relative min-h-56 overflow-hidden border-t border-[var(--line)] bg-[var(--surface-sunken)] p-6 lg:border-l lg:border-t-0">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[var(--accent)] opacity-20" />
            <div className="absolute -right-5 top-7 h-40 w-40 rounded-full border border-dashed border-[var(--accent)] opacity-30" />
            <div className="relative mt-4 space-y-5">
              {["Incident details", "Payment route", "Time window", "Authorisation"].map((label, i) => (
                <div key={label} className="flex items-center gap-3 text-xs text-[var(--ink-3)]"><span className="num grid h-7 w-7 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--accent)]">0{i + 1}</span><span>{label}</span></div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="workspaces-heading">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Dedicated pages</p><h2 id="workspaces-heading" className="mt-2 text-xl font-semibold tracking-tight">Open a workspace</h2></div>
          <p className="hidden text-xs text-[var(--ink-4)] sm:block">Nothing urgent is buried in a landing page.</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {WORKSPACES.map((space) => { const Icon = space.icon; return (
            <Link key={space.href} href={space.href} className="task-card group p-5">
              <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-3)] text-[var(--accent)]"><Icon size={20} weight="duotone" /></span><ArrowRight size={16} className="text-[var(--ink-4)] transition-transform group-hover:translate-x-1" /></div>
              <h3 className="mt-5 text-sm font-bold">{space.label}</h3><p className="mt-2 text-[0.78rem] leading-6 text-[var(--ink-3)]">{space.detail}</p>
            </Link>
          ); })}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {["Private by default", "Deterministic rules", "Model where it helps"].map((title, i) => (
          <article key={title} className="border-t border-[var(--line)] pt-4"><p className="num text-[0.64rem] text-[var(--accent)]">0{i + 1}</p><h3 className="mt-2 text-xs font-bold">{title}</h3><p className="mt-2 text-[0.72rem] leading-5 text-[var(--ink-4)]">{i === 0 ? "The case record is stored in this browser." : i === 1 ? "Urgent routing and legal branches do not depend on model output." : "OpenAI is used only to structure the complaint chronology."}</p></article>
        ))}
      </section>
    </main>
  );
}
