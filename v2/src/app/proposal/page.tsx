import Link from "next/link";
import { ArrowRight, Prohibit, Wrench } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * The system proposal.
 *
 * A front end cannot fix either problem in this product. Both come from what the
 * existing messages between NCRP, the banks and the account holder do and do not
 * carry. This page states the four field-level changes that would fix them, and
 * is deliberately written for someone who would have to implement it rather than
 * for a judge.
 *
 * Every change here is additive to a message that already exists. None of them
 * requires a new platform, a new identity system, or an amendment to the BNSS.
 */

const CHANGES = [
  {
    n: "01",
    title: "The freeze instruction must carry the disputed amount",
    today:
      "When a fraud is reported, the instruction that reaches the beneficiary bank identifies the account. It does not reliably carry the amount actually in dispute. Faced with an instruction naming an account and no figure, the safe thing for a bank to do is freeze the whole account, so that is what happens.",
    change:
      "Add four fields to the message that already travels from the reporting system to the bank. The bank then has a figure to lien against, and holding more than that figure becomes an exception it has to justify rather than the default it falls into.",
    effect:
      "Proportionality stops being something an account holder has to litigate months later and becomes a value the receiving system can check on arrival.",
    schema: `{
  "freeze_ref":            "NCRP-2026-XXXXXXX",
  "account_ref":           "<bank's own account handle>",
  "disputed_amount":       17500,          // paise-precise, mandatory
  "section_invoked":       "BNSS_106",     // 94 | 106 | 107
  "magistrate_report_ref": null,           // s.106(3) report, when filed
  "review_by":             "2026-09-25"    // see change 03
}`,
  },
  {
    n: "02",
    title: "The affected account holder needs a door",
    today:
      "The reporting system models two kinds of person: the complainant and the accused. Someone whose own account was frozen because tainted money passed through it is neither. They have no grievance type to file under, so their complaint arrives instead as a lawyer's notice, a branch escalation or an MP reference, and none of those are tracked as a queue.",
    change:
      "Add one grievance type, keyed on the freeze reference the bank already quotes to the customer. It returns the four fields from change 01 and nothing else. No case detail, no complainant identity.",
    effect:
      "An unrouted stream of complaints becomes a measurable one. Today nobody can say how many accounts are frozen this way, or for how long, because there is no field that counts it.",
    schema: `GET /grievance/affected-account/{freeze_ref}

{
  "disputed_amount":       17500,
  "section_invoked":       "BNSS_106",
  "magistrate_report_ref": "CC/1123/2026",
  "review_by":             "2026-09-25",
  "status":                "ACTIVE"
}`,
  },
  {
    n: "03",
    title: "A freeze should expire unless somebody renews it",
    today:
      "A lien continues until a person decides to lift it. Lifting it is nobody's specific job, and no field records when it should be revisited, so the passive outcome is that it stays. That is why these holds run for months on amounts of a few hundred rupees.",
    change:
      "Populate review_by at the point the freeze is created. If no magistrate_report_ref has been attached by that date, the hold automatically reduces to disputed_amount. It does not release; it narrows.",
    effect:
      "Indefinite becomes bounded, without any official having to make a decision and without weakening the investigation. The money connected to the alleged offence stays held for as long as the case needs it.",
    schema: `// on review_by, if magistrate_report_ref is null:
hold_amount = min(hold_amount, disputed_amount)
// the case is untouched. only the untainted balance is released.`,
  },
  {
    n: "04",
    title: "The acknowledgement should say what happened to the money",
    today:
      "A victim who reports in the first hour receives an acknowledgement number and then silence. They cannot tell whether a hold was placed, whether the money had already moved on, or whether the request reached the bank at all. The silence is what drives the repeat calls, the repeat filings and the belief that reporting is pointless.",
    change:
      "Return a per-bank outcome against the acknowledgement number the citizen already has. Three states are enough, and the reporting system already learns all three.",
    effect:
      "The citizen stops guessing, the helpline stops absorbing status calls, and the aggregate becomes a real measure of how well the first hour is working.",
    schema: `GET /complaint/{ack_no}/trail

[
  { "bank": "<bank 1>", "outcome": "HOLD_PLACED",  "amount": 42000 },
  { "bank": "<bank 2>", "outcome": "ALREADY_MOVED", "at": "2026-08-24T11:42Z" },
  { "bank": "<bank 3>", "outcome": "NOT_REACHED" }
]`,
  },
] as const;

const NOT_REQUIRED = [
  "A new portal, platform or app. Every change above is a field added to a message that already travels.",
  "Any new identity or authentication system. Nothing here reads Aadhaar, and change 02 is keyed on a reference the bank already gives the customer.",
  "An amendment to the BNSS. Sections 94, 106 and 107 are unchanged; these fields only record what the sections already require somebody to have decided.",
  "Access to case material. The affected account holder is shown four operational fields and never sees the complaint or the complainant.",
  "A big-bang migration. disputed_amount can be optional in the first release and mandatory once the reporting side populates it reliably.",
];

export default function ProposalPage() {
  return (
    <div className="public-grain min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="eyebrow">What a better interface cannot fix</p>
        <h1 className="display mt-4 max-w-[15ch] text-[3.3rem] leading-[0.95] sm:text-[4.8rem]">
          Four fields, not a new system.
        </h1>
        <p className="mt-6 max-w-[48rem] text-base leading-8 text-[var(--ink-2)]">
          Both problems in this product are the same problem. A message travels
          from the reporting system to a bank, and it does not carry enough
          information for the bank to do the proportionate thing. So the bank does
          the safe thing, and a person who has committed no offence loses access to
          their own money for months.
        </p>
        <p className="mt-4 max-w-[48rem] text-base leading-8 text-[var(--ink-2)]">
          None of that is fixable by redesigning a form. What follows is written
          for whoever would have to build it, and every change is additive to
          something that already exists.
        </p>

        <div className="mt-14 space-y-4">
          {CHANGES.map((c) => (
            <section key={c.n} className="public-card p-5 sm:p-7">
              <div className="flex items-baseline gap-3">
                <span className="num text-[0.8rem] font-bold text-[var(--accent-text)]">
                  {c.n}
                </span>
                <h2 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                  {c.title}
                </h2>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="eyebrow">Today</p>
                  <p className="mt-2 text-[0.84rem] leading-7 text-[var(--ink-2)]">{c.today}</p>
                  <p className="eyebrow mt-5">The change</p>
                  <p className="mt-2 text-[0.84rem] leading-7 text-[var(--ink-2)]">{c.change}</p>
                  <p className="eyebrow mt-5">Why it is worth doing</p>
                  <p className="mt-2 text-[0.84rem] leading-7 text-[var(--ink-2)]">{c.effect}</p>
                </div>
                <div className="overflow-x-auto rounded-[1rem] border border-[var(--line)] bg-[var(--surface-sunken)] p-4">
                  <pre className="num whitespace-pre text-[0.72rem] leading-6 text-[var(--ink-2)]">
                    {c.schema}
                  </pre>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="public-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--ok)]">
              <Prohibit size={18} weight="fill" />
              What this does not require
            </h2>
            <ul className="mt-5 space-y-4">
              {NOT_REQUIRED.map((item) => (
                <li key={item} className="text-[0.8rem] leading-6 text-[var(--ink-2)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="public-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--accent-text)]">
              <Wrench size={18} weight="fill" />
              What we could not verify
            </h2>
            <p className="mt-4 text-[0.8rem] leading-7 text-[var(--ink-2)]">
              We have no access to the actual message format between the national
              reporting system and the banks, and we did not attempt to obtain any.
              The field names above are ours. The claim being made is not that these
              exact keys are correct, but that the four values are the ones missing,
              and that a system holding all four could not produce the outcome this
              product exists to argue against.
            </p>
            <p className="mt-4 text-[0.8rem] leading-7 text-[var(--ink-2)]">
              The prototype implements these four fields against its own local
              case, which is how the freeze diagnostic is able to compute
              proportionality at all.
            </p>
          </div>
        </section>

        <div className="mt-14 flex flex-col gap-3 sm:flex-row">
          <Link href="/action-room/frozen" className="btn btn-primary px-5 py-3 text-sm">
            See it applied to a frozen account
            <ArrowRight size={16} />
          </Link>
          <Link href="/methodology" className="btn btn-secondary px-5 py-3 text-sm">
            Sources and prototype boundary
          </Link>
        </div>
      </main>
    </div>
  );
}
