import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SOURCES } from "@/lib/recovery";
import { CheckCircle, XCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "What is real and what is mocked - Golden Hour",
  description:
    "Every number, every legal citation and every simulated system in the Golden Hour prototype, listed plainly.",
};

const REAL = [
  "The recovery decay curve, built from published freeze-success figures.",
  "The distinction between an unauthorised transaction and one you were deceived into authorising.",
  "The RBI zero-liability rule and its 3 working day and 10 working day deadlines.",
  "Every legal citation in the freeze test: BNSS sections 94, 106 and 107, and the Madras, Bombay, Delhi and Karnataka positions.",
  "The stage machine, including the fact that frozen money generally needs an order before it comes back to you.",
  "The 1930 helpline number and the cybercrime.gov.in address.",
  "The generated letters and RTI application, which are real templates you could adapt and send.",
];

const MOCKED = [
  "Every case, acknowledgement number, bank and person in this prototype. All synthetic.",
  "Layer transit timings. The shape is realistic, the exact minutes are illustrative.",
  "The freeze request. Nothing here reaches a bank, the NCRP, the CFCFRMS or any police system.",
  "Case tracking. Stage progress responds to what you tick in this browser, not to a real case.",
  "The number of mule accounts shown in the layer map, which is derived from the model, not observed.",
];

const WOULD_NEED = [
  {
    t: "An authenticated write path into CFCFRMS",
    d: "The freeze request is the only step that moves money. Everything else in this product is a wrapper around that one call, and it is the one thing a prototype cannot have.",
  },
  {
    t: "A real clock from the bank, not from the user",
    d: "We ask the victim when the money left. A production build would read the transaction timestamp directly, because a panicking person's estimate is the weakest input in the whole model.",
  },
  {
    t: "Published SLA data per stage",
    d: "The stage owners are real, the timings are described ranges. Holding anyone to an SLA needs the actual numbers, which are not currently published per stage.",
  },
  {
    t: "Legal review, per state",
    d: "The High Courts are split on whether police may debit-freeze at all. A shipped product would need counsel maintaining the rules engine as that resolves.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12">
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
          What is real and what is mocked
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          This prototype describes a real problem using real law and real published
          figures, wrapped around systems it deliberately does not touch. Here is
          the line between the two.
        </p>

        {/* Real vs mocked */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="panel p-5">
            <h2
              className="flex items-center gap-1.5 text-[14px] font-semibold"
              style={{ color: "var(--ok)" }}
            >
              <CheckCircle size={16} weight="fill" />
              Real
            </h2>
            <ul className="mt-3 space-y-2.5">
              {REAL.map((r) => (
                <li key={r} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <h2
              className="flex items-center gap-1.5 text-[14px] font-semibold"
              style={{ color: "var(--crit)" }}
            >
              <XCircle size={16} weight="fill" />
              Mocked
            </h2>
            <ul className="mt-3 space-y-2.5">
              {MOCKED.map((m) => (
                <li key={m} className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {m}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sources */}
        <section className="mt-14">
          <h2 className="text-[24px] font-semibold tracking-tight">
            Every figure, and where it comes from
          </h2>
          <ul className="mt-6 space-y-5">
            {SOURCES.map((s, i) => (
              <li
                key={s.id}
                style={i > 0 ? { borderTop: "1px solid var(--line)", paddingTop: "1.25rem" } : undefined}
              >
                <p className="text-[14.5px] font-medium leading-snug">{s.claim}</p>
                <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--ink-2)" }}>
                  {s.where}
                </p>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: "var(--ink-4)" }}>
                  {s.note}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Where OpenAI is used */}
        <section className="mt-14">
          <h2 className="text-[24px] font-semibold tracking-tight">
            Where a model is actually used
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            One place, deliberately. A victim has to turn a confusing, upsetting
            hour into a factual chronology a police officer can act on. That is the
            wrong task to hand someone in a panic, and it is the one step where a
            model earns its place rather than decorating the page.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Everything else is a rules engine over published law and published
            figures. The decay curve, the layer model, the liability branch and the
            freeze legality test are all deterministic, because a person deciding
            what to do in the next ten minutes deserves an answer that is the same
            every time they ask.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            If no API key is configured, the drafting step falls back to a built-in
            template and the interface labels it as a template rather than passing
            it off as model output.
          </p>
        </section>

        {/* What a real one needs */}
        <section className="mt-14">
          <h2 className="text-[24px] font-semibold tracking-tight">
            What a real version would need
          </h2>
          <ol className="mt-6 space-y-5">
            {WOULD_NEED.map((w, i) => (
              <li
                key={w.t}
                className="flex gap-3"
                style={i > 0 ? { borderTop: "1px solid var(--line)", paddingTop: "1.25rem" } : undefined}
              >
                <span
                  className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold leading-snug">{w.t}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                    {w.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Privacy */}
        <section
          className="panel mt-14 p-5 sm:p-6"
          style={{ background: "var(--surface-3)" }}
        >
          <h2 className="text-[16px] font-semibold tracking-tight">
            What happens to what you type
          </h2>
          <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Your case stays in your own browser. There is no account, no database
            and no server storing it. The only thing that ever leaves your device is
            the text you write in the complaint box, and only at the moment you
            press the button to draft a complaint, and only if a model key is
            configured.
          </p>
          <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            Never enter a real Aadhaar number, PAN, card number, OTP or password
            here. This is a prototype and it does not need any of them.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/act" className="btn btn-primary px-5 py-3">
            Try the victim journey
            <ArrowRight size={16} weight="bold" />
          </Link>
          <Link href="/frozen" className="btn btn-secondary px-5 py-3">
            Try the frozen account test
          </Link>
        </div>
      </main>
    </>
  );
}
