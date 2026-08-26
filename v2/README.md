# Golden Hour — Cyber Fraud Action Room

**Live: https://golden-hour-rust-mu.vercel.app** — opens straight into the product.
No sign-up, no login, no demo credentials to type.

Built for **Build What Moves India**. Independent prototype, not affiliated with or
endorsed by any government body. All case data is synthetic.

---

## Every cyber fraud has two victims. One of them has no door.

The first is robbed and at least has a helpline.

The second **received** the money, had no idea it was stolen, and wakes up to an
entire bank balance frozen over a disputed few hundred rupees. A shopkeeper. A
freelancer. Someone who sold a phone online. They have committed no offence. They
are neither complainant nor accused, so no portal has a category for them, no
grievance type fits, and the freeze runs for months while their salary bounces.

Golden Hour is the only build here that serves both.

---

## What to try, in about 60 seconds

Reviewer path. No account needed at any point.

1. Open **https://golden-hour-rust-mu.vercel.app/action-room/frozen**
2. State **Maharashtra**, frozen **45** days → Continue
3. Balance **1860000**, disputed **175** → Continue
4. Answer the four questions however you like → **Get my position**
5. Look at the number at the top: **₹10,629 locked for every ₹1 actually in dispute**
6. Scroll to **What to do, in order** — steps unlock by day, because a complaint
   filed before a route is admissible is simply rejected
7. Open the **Letter to the bank** and **RTI application** tabs — both generated,
   both ready to send
8. Then **/proposal** — the four fields that would stop this happening at all

For the first-hour path instead, start at `/action-room/intake`.

---

## The claims, and where they come from

Every figure in the product carries its source on `/methodology`.

| Claim | Source |
| --- | --- |
| Recovery odds fall from >60% within minutes to 5–10% after a week | Published containment figures, cited on /methodology |
| Zero liability if an unauthorised transaction is reported within 3 working days | RBI circular RBI/2017-18/15, 6 July 2017 |
| Police cannot debit-freeze under s.106 BNSS; attachment needs a Magistrate under s.107 | Bombay HC 2025; Delhi HC 2026 |
| A debit freeze **is** available to police under s.106 | Karnataka HC 2026 — the courts genuinely disagree, and the app says so |
| Only the amount connected to the offence may be held, not the whole account | Madras HC, W.P. No. 25631 of 2024 |
| s.106(3) requires the seizing officer to report to the Magistrate forthwith | BNSS 2023, official India Code text |

The freeze engine is **jurisdiction-aware**: it gives different advice in
Maharashtra, Delhi and Karnataka, because the law is genuinely different there. It
reports the conflict rather than pretending there is one settled answer.

---

## What is real, and what is mocked

**Real:** the legal rules, the statutory sections, the High Court positions, the RBI
customer-protection wording, the escalation thresholds, and the generated letters.

**Mocked:** every case number, acknowledgement number, bank, amount, date and
account. The money-layer transit model. All case-stage progress.

**Not connected to anything.** No bank, no police system, no NCRP, no CFCFRMS.
Nothing is ever submitted anywhere.

---

## What the model does, and what it is forbidden from doing

One OpenAI call, one job: turning a panicking person's rough notes into the factual
chronology an officer can act on.

It is **not** allowed to invent identifiers, decide legal entitlement, rewrite
authorisation status, or set the order of urgent actions. Every legal test and every
priority decision is deterministic, because someone deciding what to do in ten
minutes deserves the same answer every time they ask. If the model call fails, a
deterministic template takes over and the UI says which one produced the draft.

The key stays server-side. Only the narrative and minimal incident context are sent,
and only when the user explicitly asks for a draft. Case data otherwise never leaves
the browser.

---

## The part a better interface cannot fix

Both problems have one cause. The freeze instruction that reaches a bank never
carries the disputed amount, so the bank freezes everything, because that is the
safe default when you are given an account and no figure.

`/proposal` specifies four additive fields that would end it — `disputed_amount`,
`section_invoked`, `magistrate_report_ref`, `review_by` — plus a grievance door for
the affected account holder. None of them require a new portal, a new identity
system, or an amendment to the BNSS.

---

## Included workflows

- Four-question cyber-fraud triage with a live recovery clock
- Actions ordered by how much each one recovers, with a 1930 call script in Hindi and English
- Illustrative money-layer map
- Local evidence checklist
- OpenAI-assisted complaint chronology with deterministic fallback
- Frozen-account diagnostic: proportionality ratio, day-gated ladder, bank letter, RTI draft
- Recovery-stage tracking
- Real-vs-simulated methodology with primary-source links

## Run locally

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run build
npm run start -- -p 3010
npm run test:smoke
```

The audit covers 40 checks: every route, WCAG AA contrast on all 12 pages, the full
triage journey, local persistence, Hindi call guidance, the live OpenAI draft, the
frozen-account outputs and the legacy-route redirects.

The server accepts either `OPENAI_API_KEY` or `OPENAI_KEY`. Never prefix either with
`NEXT_PUBLIC_`.
