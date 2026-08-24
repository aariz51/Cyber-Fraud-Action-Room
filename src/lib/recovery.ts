/**
 * THE RECOVERY CLOCK
 * ------------------
 * The core mechanism of this prototype.
 *
 * Indian cyber-fraud recovery is decided almost entirely by how fast the victim
 * reports. Published figures give us three hard anchors:
 *
 *   - reported within minutes   -> over 60% chance of a successful freeze
 *   - reported within 24 hours  -> 25-40%
 *   - reported after 7 days     -> 5-10%
 *
 * Sources are listed in SOURCES below and surfaced in the UI on /how-it-works.
 * Everything between those anchors is interpolated, and we say so on screen.
 * This curve is a MODEL built from public statements, not an official API.
 */

export interface Anchor {
  /** minutes elapsed since the money left */
  t: number;
  /** probability the money can still be frozen, 0..1 */
  p: number;
  /** true when this point comes straight from a published figure */
  published: boolean;
  label?: string;
}

/**
 * Anchor points. `published: true` entries are taken directly from the sources
 * below. The rest shape the curve between them and are flagged as interpolated
 * wherever they are shown to a user.
 */
export const ANCHORS: Anchor[] = [
  { t: 0, p: 0.68, published: false },
  { t: 5, p: 0.64, published: true, label: "Reported within minutes: over 60%" },
  { t: 30, p: 0.575, published: false },
  { t: 60, p: 0.54, published: false },
  { t: 180, p: 0.47, published: false },
  { t: 360, p: 0.42, published: false },
  { t: 720, p: 0.365, published: false },
  { t: 1440, p: 0.325, published: true, label: "Within 24 hours: 25-40%" },
  { t: 4320, p: 0.18, published: false },
  { t: 10080, p: 0.075, published: true, label: "After 7 days: 5-10%" },
  { t: 20160, p: 0.05, published: false },
  { t: 43200, p: 0.03, published: false },
];

export const SOURCES = [
  {
    id: "recovery-curve",
    claim: "Freeze success is over 60% within minutes, 25-40% within 24 hours, 5-10% after 7 days.",
    where: "Published cyber-fraud recovery guidance, aggregated",
    note: "We interpolate between these three anchors. The curve is a model, not an official figure.",
  },
  {
    id: "ncrp-volume",
    claim: "NCRP complaints rose from 4.52 lakh in 2021 to about 23 lakh in 2026.",
    where: "National Cyber Crime Reporting Portal figures reported publicly",
    note: "Used for context only. No live NCRP data is read by this prototype.",
  },
  {
    id: "cfcfrms-saved",
    claim:
      "CFCFRMS stopped about Rs 7,647 crore of roughly Rs 52,969 crore reported between April 2021 and November 2025.",
    where: "Ministry of Home Affairs figures reported publicly",
    note: "About 14% of reported money was stopped. Quoted as context, not as a prediction.",
  },
  {
    id: "mule-layer1",
    claim:
      "I4C shared over 27.3 lakh suspected Layer 1 mule accounts with banks between September 2024 and January 2026, blocking over Rs 9,518 crore.",
    where: "Indian Cyber Crime Coordination Centre figures reported publicly",
    note: "Basis for the Layer Map concept. Layer transit times in this prototype are illustrative.",
  },
  {
    id: "rbi-liability",
    claim:
      "RBI circular RBI/2017-18/15 gives zero customer liability for unauthorised electronic transactions reported within 3 working days, and requires the bank to re-credit within 10 working days.",
    where: "RBI, Customer Protection - Limiting Liability of Customers in Unauthorised Electronic Banking Transactions, 6 July 2017",
    note: "Applies to unauthorised transactions. It does not cover payments the customer was deceived into authorising.",
  },
] as const;

/**
 * Probability the money is still freezable, `minutes` after it left.
 * Log-time linear interpolation between anchors, because the decay is much
 * faster early on than it is late.
 */
export function freezeProbability(minutes: number): number {
  const m = Math.max(0, minutes);
  if (m <= ANCHORS[0].t) return ANCHORS[0].p;

  const last = ANCHORS[ANCHORS.length - 1];
  if (m >= last.t) return last.p;

  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a = ANCHORS[i];
    const b = ANCHORS[i + 1];
    if (m >= a.t && m <= b.t) {
      // interpolate on log(t + 1) so the early collapse is shaped correctly
      const la = Math.log(a.t + 1);
      const lb = Math.log(b.t + 1);
      const lm = Math.log(m + 1);
      const k = lb === la ? 0 : (lm - la) / (lb - la);
      return a.p + (b.p - a.p) * k;
    }
  }
  return last.p;
}

/** How many percentage points are lost over the next `windowMin` minutes. */
export function decayOver(minutes: number, windowMin: number): number {
  return freezeProbability(minutes) - freezeProbability(minutes + windowMin);
}

export type Urgency = "critical" | "high" | "fading" | "cold";

export function urgencyOf(minutes: number): Urgency {
  if (minutes < 60) return "critical";
  if (minutes < 1440) return "high";
  if (minutes < 10080) return "fading";
  return "cold";
}

export const URGENCY_COPY: Record<Urgency, { title: string; line: string }> = {
  critical: {
    title: "Every minute counts",
    line: "The money is most likely still sitting in the first account it landed in.",
  },
  high: {
    title: "Still recoverable",
    line: "The money has probably moved on, but a freeze further down the chain can still work.",
  },
  fading: {
    title: "Odds are low but not zero",
    line: "Most of the money has likely been withdrawn. Reporting still matters for the investigation.",
  },
  cold: {
    title: "Recovery is unlikely",
    line: "Report anyway. Your complaint links accounts to a wider pattern that police act on.",
  },
};

/** Rupee formatting, Indian digit grouping. */
export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** "3 hours 12 minutes" style elapsed text. */
export function humanElapsed(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  if (m < 1) return "less than a minute";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h < 24) {
    if (rem === 0) return `${h} hour${h === 1 ? "" : "s"}`;
    return `${h} hour${h === 1 ? "" : "s"} ${rem} minute${rem === 1 ? "" : "s"}`;
  }
  const d = Math.floor(h / 24);
  const hRem = h % 24;
  if (hRem === 0) return `${d} day${d === 1 ? "" : "s"}`;
  return `${d} day${d === 1 ? "" : "s"} ${hRem} hour${hRem === 1 ? "" : "s"}`;
}
