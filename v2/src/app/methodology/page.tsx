import Link from "next/link";
import { ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/SiteHeader";

const REAL = [
  "1930 and cybercrime.gov.in are the official national reporting routes shown by the Ministry of Home Affairs.",
  "The difference between an unauthorised transaction and a payment made under deception changes which RBI customer-protection wording applies.",
  "For qualifying unauthorised third-party breaches, RBI’s circular includes zero liability when the customer notifies the bank within three working days and a shadow reversal within ten working days.",
  "The frozen-account diagnostic uses the text of BNSS sections 94, 106 and 107 and identifies where procedural or case-specific legal review is needed.",
  "The OpenAI complaint step is limited to turning supplied facts into a chronology; it is not used for urgent routing or legal outcomes.",
];

const SIMULATED = [
  "Every case number, acknowledgement number, bank, date, amount, and account shown in demo screens.",
  "The money-layer transit model and account counts. It explains fast fan-out but is not a live trace or personal recovery forecast.",
  "The freeze request and case-stage progress. Nothing is sent to a bank, NCRP, CFCFRMS, police station, or court.",
  "Recovery status. The stage machine responds only to actions marked in this browser.",
];

const SOURCES = [
  { title: "Ministry of Home Affairs: 1930 and reporting workflow", href: "https://www.mha.gov.in/MHA1/Par2017/pdfs/par2026-pdfs/LS24032026/5124.pdf", note: "Official parliamentary answer, 24 March 2026." },
  { title: "PIB: CFCFRMS aggregate containment figures", href: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2301973&lang=2&reg=48", note: "As of 30 June 2026: ₹11,158 crore saved across 32.80 lakh complaints. This is an aggregate, not a personal recovery probability." },
  { title: "RBI customer-protection circular", href: "https://www.rbi.org.in/commonman/English/scripts/Notification.aspx?Id=2623", note: "RBI/2017-18/15, 6 July 2017." },
  { title: "Bharatiya Nagarik Suraksha Sanhita, 2023", href: "https://www.indiacode.nic.in/bitstream/123456789/21920/1/the_bharatiya_nagarik_suraksha_sanhita%2C_2023.pdf", note: "Official India Code text used for sections 94, 106 and 107." },
  { title: "Delhi High Court judgment on debit-freeze power", href: "https://delhihighcourt.nic.in/app/showlogo/1769248155_eb87a6191c1f9386_596_41982025.pdf/2026", note: "2026 judgment discussing section 106 and the separate section 107 process." },
];

export default function MethodologyPage() {
  return (
    <div className="public-grain min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="eyebrow">Proof before persuasion</p>
        <h1 className="display mt-4 max-w-[12ch] text-[3.5rem] leading-[0.95] sm:text-[5.2rem]">Real, simulated, and sourced.</h1>
        <p className="mt-6 max-w-[46rem] text-base leading-8 text-[var(--ink-2)]">Golden Hour is an independent hackathon prototype. It uses real public procedures and published sources, but it does not pretend to be a live government or banking system.</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <section className="public-card p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-bold text-[var(--ok)]"><CheckCircle size={18} weight="fill" />Real inputs and rules</h2><ul className="mt-5 space-y-4">{REAL.map((item) => <li key={item} className="text-[0.8rem] leading-6 text-[var(--ink-2)]">{item}</li>)}</ul></section>
          <section className="public-card p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-bold text-[var(--crit)]"><XCircle size={18} weight="fill" />Simulated prototype behavior</h2><ul className="mt-5 space-y-4">{SIMULATED.map((item) => <li key={item} className="text-[0.8rem] leading-6 text-[var(--ink-2)]">{item}</li>)}</ul></section>
        </div>

        <section className="mt-16"><p className="eyebrow">Primary sources</p><h2 className="display mt-3 text-[2.8rem] leading-none">The evidence layer</h2><div className="mt-7 overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-2)]">{SOURCES.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="group grid gap-2 border-b border-[var(--line)] p-5 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><div><h3 className="text-sm font-bold group-hover:text-[var(--accent)]">{source.title}</h3><p className="mt-1.5 text-[0.75rem] leading-5 text-[var(--ink-3)]">{source.note}</p></div><ArrowRight size={16} className="text-[var(--ink-4)] transition-transform group-hover:translate-x-1" /></a>)}</div></section>

        <section className="mt-16 grid gap-4 md:grid-cols-2"><div className="public-card p-6"><p className="eyebrow">Privacy boundary</p><h2 className="mt-3 text-lg font-semibold">What leaves the device</h2><p className="mt-3 text-sm leading-7 text-[var(--ink-2)]">The case record is stored in local browser storage. Only the narrative and minimal incident fields are sent to the server when the user explicitly requests an AI complaint draft. No analytics database is part of this prototype.</p></div><div className="public-card p-6"><p className="eyebrow">Model boundary</p><h2 className="mt-3 text-lg font-semibold">What OpenAI is allowed to do</h2><p className="mt-3 text-sm leading-7 text-[var(--ink-2)]">Structure supplied facts into plain-language chronology. It must not invent identifiers, rewrite authorisation status, calculate legal entitlement, or decide the urgent-action order. A deterministic template remains available if the model call fails.</p></div></section>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row"><Link href="/action-room" className="btn btn-primary px-5 py-3 text-sm">Enter Action Room<ArrowRight size={16} /></Link><a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="btn btn-secondary px-5 py-3 text-sm">Open cybercrime.gov.in</a></div>
      </main>
    </div>
  );
}
