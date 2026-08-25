# Golden Hour / पहला घंटा
### Cyber Fraud Action Room - an independent hackathon prototype

**Not a government product. Not affiliated with I4C, MHA, NCRP or any bank. All data is synthetic.**

---

## The one problem

> In Indian cyber fraud, the outcome is decided in the first hour. Nothing in the current
> experience tells the victim that, and nothing shows them the clock.

Freeze success rate, from published figures:

| Reported within | Chance the money is still freezable |
|---|---|
| Minutes | over 60% |
| 24 hours | 25-40% |
| 7 days | 5-10% |

Meanwhile the citizen-facing flow asks a panicking person to fill a long form,
gives them an acknowledgement number, and shows "Under Process" forever.

## Who

Two different people, one money trail.

1. **The victim.** Money just left. They do not know 1930 exists, they do not know
   that the NCRP complaint and the CFCFRMS freeze request are different things,
   and they do not know their odds are falling every minute.
2. **The frozen.** They received a small payment that turned out to be tainted.
   Their entire account is debit-frozen. Nobody told them why. This is the
   downstream half of the same layering chain.

## The three mechanisms

1. **The Recovery Clock.** A live decay curve modelled on published freeze-success
   figures. Every screen states the odds now, and what the next action buys.
2. **The Layer Map.** Shows the money moving L1 to L4 in real time. This is why
   speed matters, made visible for the first time.
3. **The Freeze Legality Test.** Five questions produce a legal position with real
   citations (BNSS s.106 / s.107, Madras HC W.P. 25631/2024, RBI 2017 circular),
   plus a ready bank letter and RTI draft.

## The branch nobody explains

- **Unauthorised** (someone else moved your money): RBI circular RBI/2017-18/15
  gives **zero liability if reported to the bank within 3 working days**. Bank must
  re-credit within 10 working days.
- **Authorised but deceived** (you were tricked into sending it): the RBI zero-liability
  rule does **not** apply. Your only real lever is the CFCFRMS freeze chain, and it is
  a race.

Almost no victim knows which bucket they are in. It changes everything they should do.

## What is real vs mocked

See `/how-it-works` in the app. Every number on screen carries its source.
