/**
 * THE ACTION MODEL
 * ----------------
 * What the victim should do, in the order that actually recovers money, plus the
 * honest state machine for what happens after they report.
 *
 * The ordering here is the product. The official flow leads with a long complaint
 * form. The money is decided by the freeze request, so the freeze request leads.
 */

import { freezeProbability } from "./recovery";

export type FraudRoute = "upi" | "card" | "netbanking" | "wallet" | "cash";
export type Consent = "unauthorised" | "deceived" | "unsure";

export interface CaseInput {
  amount: number;
  route: FraudRoute;
  /** minutes since the money left */
  elapsedMin: number;
  consent: Consent;
  narrative?: string;
  state?: string;
}

export const ROUTE_LABEL: Record<FraudRoute, string> = {
  upi: "UPI",
  card: "Debit or credit card",
  netbanking: "Net banking transfer",
  wallet: "Wallet or payment app",
  cash: "Cash or cheque",
};

export const CONSENT_LABEL: Record<Consent, string> = {
  unauthorised: "It moved without me doing anything",
  deceived: "I sent it, because I was misled",
  unsure: "I am not sure",
};

/* ------------------------------------------------------------------ */
/* The liability branch                                                */
/* ------------------------------------------------------------------ */

export interface LiabilityView {
  key: Consent;
  title: string;
  body: string;
  protection: string | null;
  deadlineDays: number | null;
  deadlineLabel: string | null;
}

export function liabilityFor(consent: Consent): LiabilityView {
  if (consent === "unauthorised") {
    return {
      key: "unauthorised",
      title: "You have a rule on your side that most people never hear about",
      body:
        "Because the transaction was not authorised by you, the RBI customer protection circular applies. Report it to your bank in writing and your liability is zero. The bank then has to put the money back.",
      protection:
        "Zero liability if you notify the bank within 3 working days. The bank must re-credit within 10 working days of your notification.",
      deadlineDays: 3,
      deadlineLabel: "3 working days to notify your bank in writing",
    };
  }
  if (consent === "deceived") {
    return {
      key: "deceived",
      title: "Be careful about which protection you rely on",
      body:
        "You pressed send, even though you were misled into it. The RBI zero-liability circular is written for unauthorised transactions, so banks routinely refuse these claims. Your real lever is speed: get the receiving account frozen before the money moves on.",
      protection: null,
      deadlineDays: null,
      deadlineLabel: null,
    };
  }
  return {
    key: "unsure",
    title: "Work out which kind this is, it changes everything",
    body:
      "If money left without you approving anything, the RBI circular gives you zero liability when you report within 3 working days. If you approved the payment because someone misled you, that protection generally does not apply and the freeze chain is your only real route. Report to the bank in writing either way, today.",
    protection: "Report in writing now. It preserves the 3 working day clock if this turns out to be unauthorised.",
    deadlineDays: 3,
    deadlineLabel: "Report in writing today to preserve the 3 working day clock",
  };
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type ActionId = "call1930" | "freeze" | "bank" | "evidence" | "fir";

export interface ActionSpec {
  id: ActionId;
  title: string;
  why: string;
  /** what this action buys, in percentage points of recovery odds */
  worth: (input: CaseInput) => number;
  minutesToDo: number;
  cta: string;
}

export const ACTIONS: ActionSpec[] = [
  {
    id: "call1930",
    title: "Call 1930 now",
    why:
      "1930 is staffed to raise the freeze request straight away. It is faster than any form, and the call itself starts the clock on the receiving bank.",
    worth: (i) => Math.max(0, freezeProbability(i.elapsedMin) - freezeProbability(i.elapsedMin + 90)) * 100,
    minutesToDo: 6,
    cta: "Call 1930",
  },
  {
    id: "freeze",
    title: "File the freeze request",
    why:
      "This is the step that actually stops money. It goes to the CFCFRMS system, which pushes a lien request to the receiving bank. The general complaint on NCRP does not do this on its own.",
    worth: (i) => Math.max(0, freezeProbability(i.elapsedMin) - freezeProbability(i.elapsedMin + 240)) * 100,
    minutesToDo: 9,
    cta: "Review and file",
  },
  {
    id: "bank",
    title: "Tell your own bank, in writing",
    why:
      "A phone call is not a notification. Written notice is what starts the RBI liability clock and what you will need if you have to escalate later.",
    worth: (i) => (i.consent === "unauthorised" ? 22 : i.consent === "unsure" ? 11 : 4),
    minutesToDo: 5,
    cta: "Open the draft",
  },
  {
    id: "evidence",
    title: "Save the evidence before it disappears",
    why:
      "Scammers delete accounts and chats within hours. Screenshots taken now are the difference between a traceable case and your word against nothing.",
    worth: () => 6,
    minutesToDo: 7,
    cta: "See the checklist",
  },
  {
    id: "fir",
    title: "Register an FIR",
    why:
      "The FIR is what gives an investigating officer the authority to pursue the account holders. For larger amounts it is also what banks ask for before releasing anything.",
    worth: (i) => (i.amount >= 100000 ? 9 : 5),
    minutesToDo: 30,
    cta: "How to file",
  },
];

/** Actions in the order that recovers the most money, highest value first. */
export function prioritisedActions(input: CaseInput): (ActionSpec & { points: number })[] {
  return ACTIONS.map((a) => ({ ...a, points: a.worth(input) })).sort((a, b) => {
    // call1930 and freeze always lead while the money is still catchable
    const rank = (id: ActionId) => (id === "call1930" ? 0 : id === "freeze" ? 1 : 2);
    const r = rank(a.id) - rank(b.id);
    if (r !== 0) return r;
    return b.points - a.points;
  });
}

/* ------------------------------------------------------------------ */
/* What actually happens next                                          */
/* ------------------------------------------------------------------ */

export interface Stage {
  key: string;
  name: string;
  owner: string;
  typical: string;
  /** hours after reporting that this stage is expected to complete */
  slaHours: number | null;
  detail: string;
}

export const STAGES: Stage[] = [
  {
    key: "ncrp",
    name: "Complaint recorded",
    owner: "National Cyber Crime Reporting Portal",
    typical: "Immediate",
    slaHours: 1,
    detail:
      "You get an acknowledgement number. On its own this does not move any money. It is the record that everything else hangs off.",
  },
  {
    key: "cfcfrms",
    name: "Freeze request raised",
    owner: "Citizen Financial Cyber Fraud Reporting and Management System",
    typical: "Minutes, if you called 1930",
    slaHours: 2,
    detail:
      "This is the step that reaches the receiving bank. It is a different system from the complaint, which is why calling 1930 matters more than finishing the form.",
  },
  {
    key: "lien",
    name: "Bank marks a lien",
    owner: "The bank that received the money",
    typical: "Hours to days",
    slaHours: 48,
    detail:
      "The receiving bank places a hold on whatever balance is left in the account. If the money already moved on, the request has to be re-raised against the next account in the chain.",
  },
  {
    key: "fir",
    name: "FIR registered",
    owner: "Your local police station or cyber cell",
    typical: "1 to 7 days",
    slaHours: 168,
    detail:
      "An investigating officer is assigned. This is the point at which a human being becomes accountable for your case, and the point most cases stall at.",
  },
  {
    key: "investigation",
    name: "Investigation and tracing",
    owner: "Investigating officer",
    typical: "Weeks to months",
    slaHours: null,
    detail:
      "The officer follows the account chain and issues further freeze requests. Progress here is largely invisible to you unless you ask.",
  },
  {
    key: "restoration",
    name: "Money restoration",
    owner: "Money Restoration Module, plus a court order",
    typical: "Months",
    slaHours: null,
    detail:
      "Frozen money is not automatically yours again. It generally takes an order before the bank releases it back to you. This is the stage people do not expect.",
  },
];

/** Which stages are plausibly reached at a given elapsed time, for the demo. */
export function stageProgress(elapsedMin: number, actionsDone: ActionId[]): Record<string, "done" | "active" | "waiting"> {
  const out: Record<string, "done" | "active" | "waiting"> = {};
  const called = actionsDone.includes("call1930");
  const filed = actionsDone.includes("freeze");
  const firDone = actionsDone.includes("fir");

  out.ncrp = filed ? "done" : "active";
  out.cfcfrms = called && filed ? "done" : called ? "active" : "waiting";
  out.lien = called && filed ? (elapsedMin > 120 ? "done" : "active") : "waiting";
  out.fir = firDone ? "done" : called && filed ? "active" : "waiting";
  out.investigation = firDone ? "active" : "waiting";
  out.restoration = "waiting";
  return out;
}

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export const EVIDENCE: { id: string; label: string; note: string }[] = [
  { id: "txn", label: "Transaction reference or UTR", note: "In your bank app under the payment details. This is the single most important item." },
  { id: "sms", label: "Bank SMS or email alert", note: "Screenshot it. The timestamp on the alert is what proves when you were told." },
  { id: "chat", label: "The full chat thread", note: "Scroll to the very top before screenshotting. Scammers delete accounts within hours." },
  { id: "number", label: "Phone numbers and UPI IDs used", note: "Copy them as text as well as a screenshot, so they can be searched." },
  { id: "profile", label: "Profile photo and display name", note: "Often the only identifying detail left after the account is deleted." },
  { id: "link", label: "Any link or app they sent", note: "Do not open it again. Long press and copy the address instead." },
];

/** 1930 call script, because people freeze up on the phone. */
export const CALL_SCRIPT: { en: string[]; hi: string[] } = {
  en: [
    "I want to report a financial cyber fraud that happened today.",
    "The amount is [AMOUNT] rupees, sent by [ROUTE].",
    "It left my account at [TIME].",
    "I have the transaction reference number ready.",
    "Please raise the freeze request with the receiving bank now.",
    "Please give me the acknowledgement number for this report.",
  ],
  hi: [
    "Mujhe aaj hue ek online paise ki dhokhadhadi ki shikayat darj karani hai.",
    "Rakam [AMOUNT] rupaye hai, [ROUTE] se bheji gayi thi.",
    "Yeh mere khaate se [TIME] baje gayi thi.",
    "Mere paas transaction reference number taiyaar hai.",
    "Kripya jis bank mein paisa gaya hai, wahan abhi freeze request bhejiye.",
    "Kripya mujhe is shikayat ka acknowledgement number dijiye.",
  ],
};
