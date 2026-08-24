/**
 * THE FREEZE LEGALITY TEST
 * ------------------------
 * For the second victim class: people whose own account was debit-frozen because
 * a payment they received turned out to be traceable to someone else's fraud.
 *
 * This is a rules engine over real, citable law. It is an INFORMATION tool. It is
 * not legal advice and the UI says so on every result.
 *
 * The courts genuinely disagree right now, so the engine is jurisdiction-aware
 * and reports the conflict rather than pretending there is one settled answer.
 */

export type Section = "94" | "106" | "107" | "unknown";
export type FreezeScope = "whole" | "disputed" | "unknown";
export type YesNoUnknown = "yes" | "no" | "unknown";

export interface FreezeFacts {
  state: string;
  section: Section;
  scope: FreezeScope;
  magistrateInformed: YesNoUnknown;
  notifiedWithReasons: YesNoUnknown;
  daysSinceFreeze: number;
  balanceHeld: number;
  disputedAmount: number;
}

export type Strength = "strong" | "contested" | "weak";

export interface Citation {
  ref: string;
  holding: string;
  scope: string;
}

export interface LegalityResult {
  strength: Strength;
  headline: string;
  summary: string;
  grounds: { title: string; body: string; citation?: Citation }[];
  citations: Citation[];
  jurisdiction: { court: string; posture: string };
  actions: { title: string; body: string }[];
  disproportionateAmount: number | null;
}

/* ------------------------------------------------------------------ */
/* Citations                                                           */
/* ------------------------------------------------------------------ */

export const CITATIONS: Record<string, Citation> = {
  madras: {
    ref: "Madras High Court, W.P. No. 25631 of 2024",
    holding:
      "Investigating agencies should freeze or lien only the amount connected to the alleged offence, not the entire account. The account holder must be told the reasons and given a timeline. Freezing Rs 9,69,580 when only Rs 2,48,835 was suspect was held unjustified.",
    scope: "Binding in Tamil Nadu and Puducherry. Persuasive elsewhere.",
  },
  bombay: {
    ref: "Bombay High Court, 2025",
    holding:
      "An investigating agency cannot debit-freeze a bank account under section 106 BNSS. A debit freeze operates as an attachment, which section 106 does not authorise.",
    scope: "Binding in Maharashtra, Goa, Dadra and Nagar Haveli and Daman and Diu.",
  },
  delhi: {
    ref: "Delhi High Court, 2026",
    holding:
      "Police have no power under section 106 BNSS to debit-freeze an account. Attachment can be ordered only by a Magistrate under section 107.",
    scope: "Binding in Delhi.",
  },
  karnataka: {
    ref: "Karnataka High Court, 2026",
    holding:
      "A debit freeze is a preservative measure available under section 106 BNSS and police do not need prior court permission. This runs against the Bombay and Delhi position.",
    scope: "Binding in Karnataka.",
  },
  s94: {
    ref: "Section 94, BNSS 2023 (formerly section 91 CrPC)",
    holding:
      "This section is a summons to produce documents or things. It carries no power to freeze, lien or block an account.",
    scope: "All India.",
  },
  s106: {
    ref: "Section 106, BNSS 2023 (formerly section 102 CrPC)",
    holding:
      "A police officer may seize property suspected to be stolen. Section 106(3) requires the officer to report the seizure forthwith to the jurisdictional Magistrate.",
    scope: "All India.",
  },
  s107: {
    ref: "Section 107, BNSS 2023",
    holding:
      "Attachment of property derived from criminal activity requires an order of the Magistrate. It is not something police may do on their own motion.",
    scope: "All India.",
  },
};

/* ------------------------------------------------------------------ */
/* Jurisdiction                                                        */
/* ------------------------------------------------------------------ */

interface Jurisdiction {
  court: string;
  posture: string;
  key: "madras" | "bombay" | "delhi" | "karnataka" | "other";
}

const STATE_COURT: Record<string, Jurisdiction> = {
  "Tamil Nadu": {
    court: "Madras High Court",
    key: "madras",
    posture:
      "Madras has ruled directly on proportionality. A whole-account freeze over a small disputed sum is squarely against that ruling.",
  },
  Puducherry: {
    court: "Madras High Court",
    key: "madras",
    posture:
      "Madras has ruled directly on proportionality. A whole-account freeze over a small disputed sum is squarely against that ruling.",
  },
  Maharashtra: {
    court: "Bombay High Court",
    key: "bombay",
    posture:
      "Bombay has held that police cannot debit-freeze under section 106 at all. This is the strongest position for an account holder in India right now.",
  },
  Goa: {
    court: "Bombay High Court",
    key: "bombay",
    posture:
      "Bombay has held that police cannot debit-freeze under section 106 at all. This is the strongest position for an account holder in India right now.",
  },
  Delhi: {
    court: "Delhi High Court",
    key: "delhi",
    posture:
      "Delhi has held that debit-freezing needs a Magistrate's order under section 107. A police-instructed freeze is on weak ground here.",
  },
  Karnataka: {
    court: "Karnataka High Court",
    key: "karnataka",
    posture:
      "Karnataka has upheld police debit freezes under section 106. Your strongest argument here is proportionality and notice, not the power to freeze itself.",
  },
};

const DEFAULT_JURISDICTION: Jurisdiction = {
  court: "your State High Court",
  key: "other",
  posture:
    "No High Court ruling directly on point was found for your state in this prototype. The Madras, Bombay and Delhi rulings are persuasive and are commonly cited in representations.",
};

export const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Puducherry", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export function jurisdictionFor(state: string): Jurisdiction {
  return STATE_COURT[state] ?? DEFAULT_JURISDICTION;
}

/* ------------------------------------------------------------------ */
/* The engine                                                          */
/* ------------------------------------------------------------------ */

export function assessFreeze(facts: FreezeFacts): LegalityResult {
  const jx = jurisdictionFor(facts.state);
  const grounds: LegalityResult["grounds"] = [];
  const citations: Citation[] = [];
  let score = 0;

  const push = (c: Citation) => {
    if (!citations.some((x) => x.ref === c.ref)) citations.push(c);
  };

  // Ground 1: wrong section entirely.
  if (facts.section === "94") {
    score += 3;
    grounds.push({
      title: "Section 94 carries no power to freeze",
      body:
        "The bank has cited a section that only compels production of documents. On its own terms it cannot support blocking your account.",
      citation: CITATIONS.s94,
    });
    push(CITATIONS.s94);
  }

  // Ground 2: the section 106 versus 107 fight.
  if (facts.section === "106" || facts.section === "unknown") {
    if (jx.key === "bombay" || jx.key === "delhi") {
      score += 3;
      const c = jx.key === "bombay" ? CITATIONS.bombay : CITATIONS.delhi;
      grounds.push({
        title: "Your High Court has held this freeze needs a Magistrate",
        body:
          "In your jurisdiction a debit freeze is treated as an attachment. Attachment requires an order under section 107, which a police instruction to the bank does not satisfy.",
        citation: c,
      });
      push(c);
      push(CITATIONS.s107);
    } else if (jx.key === "karnataka") {
      grounds.push({
        title: "The power to freeze is upheld in your state",
        body:
          "Karnataka permits a debit freeze under section 106 without prior court permission. Do not lead with the argument that the freeze was powerless. Lead with proportionality and notice instead.",
        citation: CITATIONS.karnataka,
      });
      push(CITATIONS.karnataka);
    } else {
      score += 1;
      grounds.push({
        title: "Whether police may freeze at all is unsettled",
        body:
          "Bombay and Delhi have held that a debit freeze is an attachment requiring a Magistrate. Karnataka has held the opposite. This conflict is worth raising in your representation.",
        citation: CITATIONS.s106,
      });
      push(CITATIONS.s106);
      push(CITATIONS.bombay);
    }
  }

  // Ground 3: magistrate not informed.
  if (facts.magistrateInformed === "no") {
    score += 2;
    grounds.push({
      title: "The Magistrate was never informed",
      body:
        "Section 106(3) requires the seizing officer to report forthwith to the jurisdictional Magistrate. If that never happened, the seizure has not been placed under judicial supervision at all.",
      citation: CITATIONS.s106,
    });
    push(CITATIONS.s106);
  } else if (facts.magistrateInformed === "unknown") {
    score += 1;
    grounds.push({
      title: "Nobody has told you whether the Magistrate was informed",
      body:
        "This is the single most useful thing to ask for in writing. Section 106(3) makes the report mandatory, so either it exists and they can produce it, or it does not and that is your strongest ground.",
      citation: CITATIONS.s106,
    });
    push(CITATIONS.s106);
  }

  // Ground 4: proportionality.
  let disproportionateAmount: number | null = null;
  if (facts.scope === "whole" && facts.balanceHeld > facts.disputedAmount) {
    score += 3;
    disproportionateAmount = facts.balanceHeld - facts.disputedAmount;
    grounds.push({
      title: "The freeze is disproportionate",
      body:
        "Only the disputed sum should be under lien. Everything above that is being held without any stated connection to the alleged offence.",
      citation: CITATIONS.madras,
    });
    push(CITATIONS.madras);
  }

  // Ground 5: natural justice.
  if (facts.notifiedWithReasons === "no") {
    score += 2;
    grounds.push({
      title: "You were never given reasons or a timeline",
      body:
        "An account holder is entitled to be told why the account was frozen and for how long. Being handed a one-line note saying the cyber cell asked for it does not meet that standard.",
      citation: CITATIONS.madras,
    });
    push(CITATIONS.madras);
  }

  // Ground 6: duration.
  if (facts.daysSinceFreeze > 60) {
    score += 2;
    grounds.push({
      title: `The freeze has run for ${facts.daysSinceFreeze} days`,
      body:
        "An indefinite hold with no judicial review and no charge against you is difficult to defend. Duration strengthens every other ground you have.",
    });
  } else if (facts.daysSinceFreeze > 30) {
    score += 1;
    grounds.push({
      title: `The freeze has run for ${facts.daysSinceFreeze} days`,
      body:
        "Past a month with no communication, ask in writing for the current status and the Magistrate's file number.",
    });
  }

  const strength: Strength = score >= 6 ? "strong" : score >= 3 ? "contested" : "weak";

  const headline =
    strength === "strong"
      ? "This freeze looks legally vulnerable"
      : strength === "contested"
        ? "You have real arguments, but it is contested"
        : "The freeze may be lawful, but you can still force answers";

  const summary =
    strength === "strong"
      ? "On the facts you gave, several requirements appear to have been missed. A written representation citing them is usually enough, and most of these cases never reach court."
      : strength === "contested"
        ? "Some requirements appear to have been missed and others are unclear. Ask for the missing information in writing first, because the answers usually decide the case."
        : "Nothing you described is clearly defective yet. The fastest route is to establish the facts in writing, since banks frequently cannot produce the underlying notice.";

  const actions: LegalityResult["actions"] = [
    {
      title: "Send the bank a written demand",
      body:
        "Ask for the freeze notice, the section relied on, the disputed amount and the Magistrate report. Send it by email so you have a timestamp. Most banks fold at this step.",
    },
    {
      title: "File an RTI with the police",
      body:
        "An RTI costs Rs 10 and asks one question: is any case registered against you in that district. A reply saying no is the single most effective document for getting a freeze lifted.",
    },
  ];

  if (disproportionateAmount && disproportionateAmount > 0) {
    actions.push({
      title: "Ask for a partial release now",
      body:
        "Do not wait for the whole dispute to resolve. Ask specifically for release of the amount above the disputed sum, citing the proportionality ruling.",
    });
  }

  actions.push({
    title: "Escalate to the Banking Ombudsman",
    body:
      "If the bank does not respond within 30 days, the RBI Ombudsman scheme covers a bank's failure to act on your representation. This is free.",
  });

  if (strength === "strong") {
    actions.push({
      title: "A writ petition is a real option",
      body:
        "Account holders have obtained relief by writ where the freeze was disproportionate or unreported. Speak to a lawyer before filing.",
    });
  }

  return {
    strength,
    headline,
    summary,
    grounds,
    citations,
    jurisdiction: { court: jx.court, posture: jx.posture },
    actions,
    disproportionateAmount,
  };
}

/* ------------------------------------------------------------------ */
/* Document generation                                                 */
/* ------------------------------------------------------------------ */

export function bankLetter(facts: FreezeFacts, result: LegalityResult): string {
  const sectionLine =
    facts.section === "unknown"
      ? "the statutory provision relied upon (whether section 94, 106 or 107 of the BNSS, 2023)"
      : `the basis for reliance on section ${facts.section} of the BNSS, 2023`;

  const proportion = result.disproportionateAmount
    ? `\n4. My account held ${inr(facts.balanceHeld)} at the time of the freeze, while the disputed credit is ${inr(facts.disputedAmount)}. I request immediate release of ${inr(result.disproportionateAmount)}, being the balance unconnected to any alleged offence. The Madras High Court in W.P. No. 25631 of 2024 has held that only the amount connected to the alleged offence may be placed under lien.\n`
    : "";

  return `To
The Branch Manager
[Bank name and branch]

Subject: Debit freeze on account [account number] - request for particulars and release

Sir or Madam,

My account with your branch has been under a debit freeze since [date], a period of ${facts.daysSinceFreeze} days. I have received no notice stating the reasons for this action or the period for which it will continue.

I request the following in writing within seven working days.

1. A copy of the communication from the law enforcement agency on which the freeze was actioned, including its reference number and date.
2. Confirmation of ${sectionLine}.
3. Confirmation of whether a report under section 106(3) of the BNSS, 2023 was made to the jurisdictional Magistrate, and if so the date and the case reference.${proportion}
${result.disproportionateAmount ? "5" : "4"}. Confirmation of the exact amount specified as disputed by the agency.

I would draw your attention to the position that a bank is empowered to mark a lien on the disputed amount and is not authorised to impose a blanket debit freeze on an entire account without the amount being specified.

If I do not receive a substantive reply within seven working days I will refer this matter to the Banking Ombudsman under the Reserve Bank of India's integrated ombudsman scheme, and will seek appropriate relief.

Yours faithfully,
[Your name]
[Account number]
[Contact number and email]
[Date]

---
Prepared with Golden Hour, an independent prototype. This is a template, not legal advice.
Have a lawyer review it before sending if the amount is significant.`;
}

export function rtiDraft(facts: FreezeFacts): string {
  return `To
The Public Information Officer
Office of the Superintendent of Police
[District], ${facts.state}

Subject: Application under the Right to Information Act, 2005

Sir or Madam,

I request the following information.

1. Whether any First Information Report or complaint stands registered against me, [your full name], holder of bank account [account number] with [bank name], in any police station within this district.

2. If yes, the FIR or complaint number, the date of registration and the sections invoked.

3. Whether any communication was issued by any police station in this district to [bank name] directing a freeze, lien or debit restriction on the said account. If yes, the date, reference number and the statutory provision under which it was issued.

4. Whether a report under section 106(3) of the Bharatiya Nagarik Suraksha Sanhita, 2023 was submitted to the jurisdictional Magistrate in respect of that action, and if so the date of such report.

I enclose the prescribed fee of Rs 10.

Yours faithfully,
[Your name]
[Full postal address]
[Contact number]
[Date]

---
Prepared with Golden Hour, an independent prototype. Verify the addressee and fee mode for your state before filing.`;
}

function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
