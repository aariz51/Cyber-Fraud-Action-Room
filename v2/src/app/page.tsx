import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bank,
  ClockCountdown,
  FileText,
  FolderOpen,
  Path,
  PhoneCall,
  Snowflake,
} from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/SiteHeader";

const MODULES = [
  { icon: ClockCountdown, eyebrow: "Emergency path", title: "Money just moved", body: "Four questions, then a live clock and one prioritised action at a time.", href: "/action-room/intake", cta: "Start triage" },
  { icon: Snowflake, eyebrow: "The other victim", title: "My account is frozen", body: "One tainted rupee can lock an entire balance for months. Test whether that freeze is even lawful.", href: "/action-room/frozen", cta: "Check the freeze" },
  { icon: FolderOpen, eyebrow: "Prepared response", title: "I need to organise my case", body: "Preserve evidence, build a chronology, and track every follow-up.", href: "/action-room", cta: "Open workspace" },
] as const;

export default function Home() {
  return (
    <div className="public-grain min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-28">
          <div className="lg:col-span-6">
            <p className="eyebrow">Independent OpenAI hackathon prototype</p>
            <h1 className="display mt-5 max-w-[10ch] text-[3.7rem] leading-[0.94] sm:text-[5.2rem] lg:text-[6.2rem]">Know what to do next.</h1>
            <p className="mt-7 max-w-[39rem] text-[1.02rem] leading-8 text-[var(--ink-2)] sm:text-[1.12rem]">
              Recovery odds fall from sixty percent to five within a week. Golden Hour
              shows you that clock, and works for both people the same fraud hits: the one
              who was robbed, and the one whose account is frozen because the money passed
              through it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/action-room" className="btn btn-primary px-5 py-3.5 text-sm">Enter Action Room <ArrowRight size={17} weight="bold" /></Link>
              <a href="tel:1930" className="btn btn-emergency px-5 py-3.5 text-sm"><PhoneCall size={17} weight="fill" />Call 1930</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[0.74rem] font-semibold text-[var(--ink-3)]">
              <span>NO SIGN-UP</span><span>DEVICE-LOCAL CASE</span><span>ENGLISH + हिंदी</span><span>DEMO DATA</span>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="hero-visual aspect-[1.08]">
              <Image src="/assets/golden-hour-north-star.png" alt="Abstract clock, evidence, and interrupted transaction-path materials in ivory, graphite, and amber" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-white/10 bg-[#111617]/90 p-4 text-[#f5f0e6] shadow-2xl backdrop-blur sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#efad48]"><span className="h-2 w-2 rounded-full bg-[#efad48] shadow-[0_0_0_5px_rgba(239,173,72,.12)]" />REPORT NOW</span>
                  <span className="num text-[0.68rem] text-[#aaa79f]">LOCAL CASE • READY</span>
                </div>
                <div className="route-line my-4" />
                <div className="grid grid-cols-3 gap-3 text-[0.68rem] text-[#aaa79f]">
                  <span><strong className="block text-[#f5f0e6]">01</strong>Triage</span>
                  <span><strong className="block text-[#f5f0e6]">02</strong>Act</span>
                  <span><strong className="block text-[#f5f0e6]">03</strong>Track</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_66%,transparent)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-7 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-5"><p className="eyebrow">Choose the situation</p><h2 className="display mt-3 text-[2.8rem] leading-none sm:text-[3.6rem]">One door. Then a focused workspace.</h2></div>
              <p className="max-w-[38rem] text-sm leading-7 text-[var(--ink-2)] lg:col-span-6 lg:col-start-7">The public page explains the product. The Action Room does the work on dedicated pages, so urgent steps never compete with marketing content.</p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {MODULES.map((module) => { const Icon = module.icon; return (
                <Link key={module.title} href={module.href} className="public-card group p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)]"><Icon size={22} weight="duotone" /></span><ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></div>
                  <p className="eyebrow mt-8">{module.eyebrow}</p><h3 className="mt-2 text-lg font-semibold tracking-tight">{module.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">{module.body}</p><p className="mt-5 text-xs font-bold text-[var(--accent)]">{module.cta}</p>
                </Link>
              ); })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5"><p className="eyebrow">A product, not a long article</p><h2 className="display mt-3 text-[2.8rem] leading-none sm:text-[3.6rem]">Every job has its own page.</h2></div>
            <div className="grid gap-px overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:col-span-7">
              {[[PhoneCall, "Act now", "A call script and ordered first-hour actions."], [Path, "Trace the money", "A visual layer map with honest demo assumptions."], [FileText, "Build the complaint", "OpenAI turns rough notes into a factual chronology."], [Bank, "Track the response", "A visible stage machine for what happens after reporting."]].map(([Icon, title, body]) => { const ItemIcon = Icon as typeof PhoneCall; return (
                <article key={title as string} className="bg-[var(--surface-2)] p-5 sm:p-6"><ItemIcon size={20} weight="duotone" color="var(--accent)" /><h3 className="mt-5 text-sm font-bold">{title as string}</h3><p className="mt-2 text-[0.8rem] leading-6 text-[var(--ink-3)]">{body as string}</p></article>
              ); })}
            </div>
          </div>
        </section>

        <section className="bg-[#101416] px-4 py-16 text-[#f5f0e6] sm:px-6 sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
            <div><p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#e9a23b]">Prototype boundary</p><h2 className="display mt-3 max-w-[12ch] text-[3rem] leading-none sm:text-[4rem]">Real workflow. Synthetic case data.</h2><p className="mt-5 max-w-[43rem] text-sm leading-7 text-[#b9b6af]">Golden Hour does not connect to a bank, police system, NCRP, or CFCFRMS. It preserves local state, makes the next action visible, and clearly labels every simulated step.</p></div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row"><Link href="/methodology" className="btn border border-[#424a4d] bg-[#171c1e] px-5 py-3 text-sm text-[#f5f0e6]">Review sources</Link><Link href="/action-room" className="btn bg-[#e9a23b] px-5 py-3 text-sm text-[#111416]">Enter Action Room <ArrowRight size={17} weight="bold" /></Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
