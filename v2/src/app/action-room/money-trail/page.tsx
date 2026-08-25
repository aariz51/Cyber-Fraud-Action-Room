"use client";

import Link from "next/link";
import { ArrowRight, Info, Path } from "@phosphor-icons/react";
import { LayerMap } from "@/components/LayerMap";
import { DemoControls } from "@/components/DemoControls";
import { useCase } from "@/lib/store";

export default function MoneyTrailPage() {
  const { kase, elapsedMin } = useCase();
  const amount = kase?.amount ?? 50000;
  const elapsed = kase ? elapsedMin : 35;

  return (
    <main className="app-page">
      <header className="max-w-3xl"><p className="eyebrow">Illustrative containment model</p><h1 className="display mt-3 text-[2.9rem] leading-none sm:text-[4rem]">Money trail</h1><p className="mt-4 text-sm leading-7 text-[var(--ink-3)]">A visual explanation of rapid fan-out through intermediary accounts. It teaches why fast reporting matters; it is not a live bank trace and does not estimate your personal recovery.</p></header>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div><LayerMap elapsedMin={elapsed} amount={amount} /></div>
        <aside className="space-y-4">
          <div className="glass-panel p-5"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Path size={18} weight="duotone" color="var(--accent)" /><strong className="text-sm">Model status</strong></span><span className="chip bg-[var(--accent-soft)] text-[var(--accent)]">{kase ? "CASE MODEL" : "DEMO MODEL"}</span></div><div className="route-line my-5" /><div className="grid grid-cols-3 gap-3 text-center"><div><span className="num block text-lg text-[var(--accent)]">L1</span><span className="text-[0.65rem] text-[var(--ink-4)]">Receiving bank</span></div><div><span className="num block text-lg text-[var(--ink-2)]">L2</span><span className="text-[0.65rem] text-[var(--ink-4)]">Intermediary</span></div><div><span className="num block text-lg text-[var(--crit)]">OUT</span><span className="text-[0.65rem] text-[var(--ink-4)]">Cash-out</span></div></div></div>
          {kase && <DemoControls />}
          <div className="panel p-5"><div className="flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" /><p className="text-[0.75rem] leading-6 text-[var(--ink-3)]">Transit timings and account counts are illustrative because live inter-bank data is unavailable to this prototype. The interface labels the model at the point of use.</p></div><Link href="/action-room/what-to-do" className="btn btn-primary mt-5 w-full px-4 py-3 text-sm">Go to urgent actions<ArrowRight size={15} /></Link></div>
        </aside>
      </div>
    </main>
  );
}
