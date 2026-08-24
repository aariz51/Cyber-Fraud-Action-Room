import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import {
  ArrowRight,
  PhoneCall,
  ShieldWarning,
  Snowflake,
  Path,
  Scales,
} from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero. Two doors, because there are two victims of the same money trail. */}
        <section className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[52px]">
                The first hour decides
                <br />
                whether you get your money back.
              </h1>
              <p
                className="mt-5 max-w-[46ch] text-[17px] leading-relaxed"
                style={{ color: "var(--ink-2)" }}
              >
                Golden Hour shows you the clock, then what to do in the order that
                actually recovers money.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/act" className="btn btn-primary px-5 py-3.5 text-[15px]">
                  <ShieldWarning size={18} weight="fill" />
                  Money just left my account
                </Link>
                <Link href="/frozen" className="btn btn-secondary px-5 py-3.5 text-[15px]">
                  <Snowflake size={18} weight="fill" />
                  My account was frozen
                </Link>
              </div>
            </div>

            {/* The three published anchors. Stat tiles, not a chart. */}
            <div className="lg:col-span-5">
              <div
                className="panel h-full p-5 sm:p-6"
                style={{ background: "var(--surface-3)" }}
              >
                <p className="text-[13px] font-medium" style={{ color: "var(--ink-3)" }}>
                  Chance a freeze still works, by when you report
                </p>
                <dl className="mt-4 space-y-4">
                  {[
                    { k: "Within minutes", v: "over 60%", tone: "var(--ok)" },
                    { k: "Within 24 hours", v: "25 to 40%", tone: "var(--warn)" },
                    { k: "After 7 days", v: "5 to 10%", tone: "var(--crit)" },
                  ].map((row, i) => (
                    <div
                      key={row.k}
                      className="flex items-baseline justify-between gap-4"
                      style={
                        i > 0
                          ? { borderTop: "1px solid var(--line)", paddingTop: "1rem" }
                          : undefined
                      }
                    >
                      <dt className="text-sm" style={{ color: "var(--ink-2)" }}>
                        {row.k}
                      </dt>
                      <dd
                        className="num text-[22px] font-semibold leading-none"
                        style={{ color: row.tone }}
                      >
                        {row.v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs leading-snug" style={{ color: "var(--ink-4)" }}>
                  Published recovery figures. Nothing in the current reporting flow
                  tells a victim any of this while it still matters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The gap. Full-width band, different layout family. */}
        <section
          className="border-y py-14"
          style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-[24ch] text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
              India reported 23 lakh cyber crimes last year. About 14% of the money
              was stopped.
            </h2>
            <p
              className="mt-4 max-w-[62ch] text-[15px] leading-relaxed"
              style={{ color: "var(--ink-2)" }}
            >
              Between April 2021 and November 2025, roughly Rs 52,969 crore was
              reported as defrauded. Around Rs 7,647 crore was stopped in time. The
              rest moved through a chain of mule accounts while the victim was still
              filling in a form.
            </p>
          </div>
        </section>

        {/* The three mechanisms. Asymmetric, numbered, not three equal cards. */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            What this does differently
          </h2>

          <div className="mt-9 space-y-px">
            {[
              {
                icon: <PhoneCall size={20} weight="duotone" />,
                title: "Triage first, form later",
                body: "The official flow opens with a long complaint form. The money is decided by the freeze request, so the freeze request leads. One action per screen, in the order that recovers the most money, with a script for the 1930 call because people freeze up on the phone.",
              },
              {
                icon: <Path size={20} weight="duotone" />,
                title: "You can see where the money is",
                body: "Stolen funds fan out through mule accounts within minutes. Banks receive I4C lists for Layer 1, which is why Layer 1 is the only layer reliably worth chasing. Watching it move is what makes speed mean something.",
              },
              {
                icon: <Scales size={20} weight="duotone" />,
                title: "If your account was frozen, a legal test",
                body: "Receive one tainted rupee and your whole account can be locked for months. Five questions produce a position with real citations, a letter to your bank and an RTI draft. Courts have been clear that only the disputed amount may be held.",
              },
            ].map((m, i) => (
              <article
                key={m.title}
                className="grid gap-3 py-7 sm:grid-cols-12 sm:gap-8"
                style={i > 0 ? { borderTop: "1px solid var(--line)" } : undefined}
              >
                <div className="flex items-center gap-3 sm:col-span-4 sm:items-start">
                  <span style={{ color: "var(--accent)" }}>{m.icon}</span>
                  <h3 className="text-[17px] font-semibold leading-snug tracking-tight">
                    {m.title}
                  </h3>
                </div>
                <p
                  className="text-[15px] leading-relaxed sm:col-span-8"
                  style={{ color: "var(--ink-2)" }}
                >
                  {m.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* The branch. Two columns, a comparison, a different family again. */}
        <section
          className="border-y py-14"
          style={{ background: "var(--surface-3)", borderColor: "var(--line)" }}
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-[30ch] text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
              Almost nobody knows which of these two situations they are in.
            </h2>
            <p
              className="mt-3 max-w-[60ch] text-[15px] leading-relaxed"
              style={{ color: "var(--ink-2)" }}
            >
              It changes which protection applies, and therefore what you should do
              first. We ask one question and route accordingly.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="panel p-5">
                <span
                  className="chip"
                  style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
                >
                  Unauthorised
                </span>
                <h3 className="mt-3 text-[16px] font-semibold leading-snug">
                  Money moved without you approving it
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  RBI circular RBI/2017-18/15 gives you zero liability if you notify
                  your bank within 3 working days. The bank must re-credit within 10
                  working days.
                </p>
              </div>

              <div className="panel p-5">
                <span
                  className="chip"
                  style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
                >
                  Authorised but deceived
                </span>
                <h3 className="mt-3 text-[16px] font-semibold leading-snug">
                  You pressed send, because you were misled
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  The zero-liability circular is written for unauthorised
                  transactions, so banks routinely refuse these. Speed is your only
                  real lever, which is why the clock matters more here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Close */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
                Try the full journey
              </h2>
              <p className="mt-2 max-w-[52ch] text-[15px]" style={{ color: "var(--ink-2)" }}>
                Nothing you type is sent anywhere. Every case, bank and reference
                number in this prototype is synthetic.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/how-it-works" className="btn btn-secondary px-4 py-3">
                What is mocked
              </Link>
              <Link href="/act" className="btn btn-primary px-5 py-3">
                Start
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="border-t py-8"
        style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}
      >
        <div
          className="mx-auto max-w-6xl px-4 text-[13px] leading-relaxed"
          style={{ color: "var(--ink-3)" }}
        >
          <p>
            Golden Hour is an independent prototype built for a hackathon. It is not
            a government service, is not affiliated with I4C, MHA, the NCRP or any
            bank, and does not connect to any live system.
          </p>
          <p className="mt-2">
            If money has actually left your account, call{" "}
            <a
              href="tel:1930"
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--accent)" }}
            >
              1930
            </a>{" "}
            and report at cybercrime.gov.in.
          </p>
        </div>
      </footer>
    </>
  );
}
