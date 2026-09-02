# Golden Hour / पहला घंटा

### Cyber Fraud Action Room

**An independent hackathon prototype. Not a government service, not affiliated with I4C, MHA, the NCRP or any bank. Every case, name and number in it is synthetic.**

Live: https://golden-hour-rust-mu.vercel.app

---

> In Indian cyber fraud, the outcome is decided in the first hour. Nothing in the
> current experience tells the victim that, and nothing shows them the clock.

| Reported within | Chance the money is still freezable |
| --- | --- |
| Minutes | over 60% |
| 24 hours | 25 to 40% |
| 7 days | 5 to 10% |

NCRP complaints went from 4.52 lakh in 2021 to about 23 lakh in 2026. Of roughly
Rs 52,969 crore reported as defrauded between April 2021 and November 2025, about
Rs 7,647 crore was stopped. The other 86% moved through a chain of mule accounts
while the victim was still filling in a form.

## Two people, one money trail

1. **The victim.** Money just left. They do not know 1930 exists, they do not know
   the NCRP complaint and the CFCFRMS freeze request are different things, and
   nobody has told them their odds are falling every minute.
2. **The frozen.** They received a small payment that turned out to be tainted, so
   their entire account is debit-frozen. No notice, no reachable officer. This is
   the downstream half of the same chain.

## The three mechanisms

**1. The Recovery Clock.** A live decay curve built from published freeze-success
figures. Every screen states the odds now and what the next action buys. Published
anchors are drawn as hollow dots so you can see which part of the line is real and
which is our interpolation.

**2. The Layer Map.** Money fans out through mule accounts within minutes. Banks
hold I4C lists for Layer 1, which is why Layer 1 is the only layer reliably worth
chasing. Watching it move is what makes "act fast" mean something.

**3. The Freeze Legality Test.** Five questions produce a legal position with real
citations, a letter to the bank and an RTI draft. The High Courts are currently
split on whether police may debit-freeze at all, so the engine is jurisdiction
aware and reports the conflict instead of pretending it is settled.

## The branch nobody explains

- **Unauthorised** (someone else moved your money): RBI circular RBI/2017-18/15
  gives **zero liability if you notify your bank within 3 working days**, and the
  bank must re-credit within 10 working days.
- **Authorised but deceived** (you were tricked into sending it): that circular is
  written for unauthorised transactions, so banks routinely refuse these claims.
  Speed is the only real lever.

Almost no victim knows which bucket they are in. It changes everything they should
do first, so it is one of the four triage questions.

## Running it

```bash
npm install
npm run dev
```

Optional, for the complaint drafting step:

```bash
cp .env.example .env.local   # then add OPENAI_API_KEY
```

Without a key the journey still completes end to end. The drafting route falls
back to a deterministic template and the interface labels it as a template rather
than passing it off as model output.

## Where a model is actually used

One place, deliberately: turning a victim's confused account of a bad hour into
the factual chronology a police officer can act on. That is the wrong task to hand
someone in a panic, and it is the single step where a model earns its place rather
than decorating the page.

Everything else is a rules engine over published law and published figures. The
decay curve, the layer model, the liability branch and the freeze legality test
are all deterministic, because someone deciding what to do in the next ten minutes
deserves the same answer every time they ask.

## What is real and what is mocked

Listed in full at `/how-it-works` in the running app, with a source line against
every figure. In short:

**Real.** The decay curve anchors. The unauthorised versus deceived distinction
and the RBI deadlines. Every legal citation: BNSS sections 94, 106 and 107, and
the Madras, Bombay, Delhi and Karnataka positions. The stage owners. The generated
letters and RTI, which are templates you could adapt and send.

**Mocked.** Every case, acknowledgement number and bank. Layer transit timings,
which are illustrative. The freeze request itself, which reaches nothing. Case
tracking, which responds to what you tick in your own browser.

## Privacy

Your case lives in your browser. There is no account, no database, no server
storing it. The only thing that ever leaves the device is the text you write in
the complaint box, at the moment you press the draft button, and only if a model
key is configured.

Never enter a real Aadhaar number, PAN, card number, OTP or password. The
prototype does not need any of them.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Phosphor icons.
No database. State is `useSyncExternalStore` over `localStorage`.

The shipped app is in `v2/`. The earlier build is kept in `src/` for reference.

## How the model is used

Built with Codex throughout. At runtime an OpenAI model does exactly one job: it
turns the victim's rough notes into a factual complaint chronology.

It is never allowed to invent an identifier, decide legal entitlement, or set the
order of actions. Those come from a deterministic rule set, so the same facts
always produce the same guidance and the same statutory deadlines. The app runs
without an API key by falling back to that deterministic path, and labels on
screen which of the two produced the answer.

## Running it

```bash
cd v2
npm install
npm run dev
```

The complaint drafter needs an OpenAI key. Everything else, including the
Recovery Clock, the Layer Map and the freeze legality engine, runs without one.

```bash
OPENAI_API_KEY=sk-...
```

## Tests

```bash
cd v2
node tests/statutory.test.mjs    # the statutory deadline ladder
node tests/audit.mjs             # 40 content and disclosure checks
```

## Licence

MIT. See [LICENSE](LICENSE).

## If money has actually left your account

Call **1930** and report at **cybercrime.gov.in**. Do that before you read
anything else.
