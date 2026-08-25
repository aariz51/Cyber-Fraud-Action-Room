# Submission pack

Deadline: 28 August 2026, 8:00 PM IST. No grace period.

---

## Project summary (238 words, limit is 250)

In Indian cyber fraud the outcome is decided in the first hour. Published figures
put the chance of successfully freezing stolen money at over 60% within minutes,
25 to 40% within 24 hours, and 5 to 10% after seven days. Nothing in the current
reporting experience tells a victim this, and nothing shows them the clock. They
are handed a long form, then an acknowledgement number, then silence.

Golden Hour replaces the form-first flow with a triage-first one. Four questions,
then a live Recovery Clock showing the odds now and what each next action buys. A
Layer Map shows the money fanning out through mule accounts in real time, which is
what makes speed mean something rather than being advice nobody acts on. Actions
are ordered by how much money they recover, so calling 1930 leads, with a script
in Hindi or English because people go blank on the phone.

One triage question decides which protection applies. If the transaction was
unauthorised, the RBI circular gives zero liability when the bank is told within
three working days. If the victim was deceived into authorising it, that rule does
not apply and speed is the only lever. Almost nobody knows which case they are in.

A second journey serves the other victim of the same money trail: people whose own
account was frozen because they received one tainted rupee. Five questions produce
a legal position with real citations, a bank letter and an RTI draft.

Synthetic data throughout. Independent prototype.

---

## Two-minute video script

### Minute one, as a citizen

**0:00 to 0:12**
"Someone just took fifty thousand rupees from my account." Land on the home page.
Read the headline out. Point at the three published numbers: over 60% within
minutes, 5 to 10% after a week. "Nobody tells you this while it still matters."

**0:12 to 0:30**
Click through the four triage questions. Amount, route, when, and then the one
that matters: did you approve the payment. "This last question decides which law
protects you, and almost nobody knows the answer changes everything."

**0:30 to 0:55**
The action room opens. Sit on the clock: 57%, falling 1.3 points every ten
minutes. Then the Layer Map: "your money is still mostly in the first account,
which is the only one banks reliably catch."

Then the actions. "The official flow opens with a form. The freeze request is what
actually stops money, so that leads." Open the 1930 script, switch it to Hindi.

**0:55 to 1:05**
Hit the reviewer time-travel control. +6 hours. The clock drops to 41%, the tone
changes, the money visibly moves to Layer 3 and the account count jumps from 4 to
43. "This is the argument, made visible."

**1:05 to 1:15**
Jump to the frozen-account journey. Enter the real scenario: 175 rupees disputed,
18.6 lakh frozen. The verdict comes back with the Bombay High Court position and a
generated letter demanding release of the difference.

### Minute two, how and why

**1:15 to 1:35**
"Three mechanisms, not three features. The clock is a decay curve built from
published anchors, drawn as hollow dots so you can see what is real and what is
our interpolation. The layer model explains why the clock matters. The legality
engine is real law: BNSS 106 and 107, Madras, Bombay, Delhi and Karnataka, which
genuinely disagree, so it is jurisdiction aware."

**1:35 to 1:50**
"A model is used in exactly one place: turning a panicking person's account of a
bad hour into a chronology a police officer can act on. Everything else is
deterministic, because someone deciding what to do in ten minutes deserves the
same answer every time. With no key configured it falls back to a template, and
the interface says so rather than pretending."

**1:50 to 2:00**
Open `/how-it-works`. "Every figure carries its source. Every mock is listed.
The one thing a prototype cannot have is the authenticated write into CFCFRMS, and
that is the only step that actually moves money. Everything here is the wrapper
that should exist around it."

---

## Submission checklist

- [ ] Live public link that opens without requesting access
- [ ] Video under two minutes, public link
- [ ] Summary under 250 words (above)
- [ ] Partner's registered email, or blank if solo
- [ ] Confirm every demoed feature works
- [ ] Confirm no real Aadhaar, PAN, OTP, card or payment data anywhere

## How the OpenAI requirement is satisfied

The rule is an **or**: the prototype should be built with Codex **or** powered by
an OpenAI model, and the submission should explain how Codex contributed.

**The runtime path is already wired.** Set `OPENAI_API_KEY` in `.env.local` and
the complaint-drafting step is genuinely powered by an OpenAI model. That is a
real, verifiable claim you can make in the form:

> The complaint drafting step is powered by an OpenAI model. A victim has to turn
> a confusing, upsetting hour into the factual chronology a police officer can act
> on, which is the wrong task to hand someone in a panic. That is the one step
> where the model earns its place. Everything else is deterministic, because
> someone deciding what to do in the next ten minutes deserves the same answer
> every time they ask. `src/app/api/draft/route.ts`

Verify it before submitting: open the freeze-request step and generate a draft.
The chip must read **"Written by an OpenAI model"**, not "Built-in template". If
it says template, the key is not being read.

**If you also run a Codex pass** over the repo before submitting, describe what it
actually did in your own words here:

> _[Describe your Codex contribution. Keep it accurate: judges score honesty, and
> a claim that does not match the repo is worse than a smaller true one.]_
