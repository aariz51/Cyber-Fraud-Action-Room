"use client";

import { useState } from "react";
import {
  CheckCircle,
  Circle,
  Copy,
  Check,
  ShieldCheck,
  Info,
  MapPin,
} from "@phosphor-icons/react";
import { EVIDENCE, liabilityFor, ROUTE_LABEL, STAGES, stageProgress } from "@/lib/case";
import type { ActionId } from "@/lib/case";
import type { CaseState } from "@/lib/store";
import { formatINR } from "@/lib/recovery";

/* ------------------------------------------------------------------ */
/* Which protection applies                                            */
/* ------------------------------------------------------------------ */

export function LiabilityCard({ kase }: { kase: CaseState }) {
  const v = liabilityFor(kase.consent);
  const tone = v.protection ? "ok" : "warn";

  return (
    <section
      className="panel p-5"
      style={{ borderColor: `color-mix(in srgb, var(--${tone}) 30%, var(--line))` }}
      aria-labelledby="liability-heading"
    >
      <div className="flex items-start gap-2.5">
        <ShieldCheck
          size={18}
          weight="duotone"
          className="mt-0.5 shrink-0"
          style={{ color: `var(--${tone})` }}
        />
        <div>
          <h2 id="liability-heading" className="text-[15px] font-semibold leading-snug">
            {v.title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {v.body}
          </p>

          {v.protection && (
            <p
              className="mt-3 rounded-[10px] px-3 py-2.5 text-[13.5px] leading-snug"
              style={{ background: `var(--${tone}-soft)`, color: `var(--${tone})` }}
            >
              {v.protection}
            </p>
          )}

          <p className="mt-3 text-xs leading-snug" style={{ color: "var(--ink-4)" }}>
            Based on RBI circular RBI/2017-18/15, Customer Protection, 6 July 2017.
            This is general information, not legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bank notification letter                                            */
/* ------------------------------------------------------------------ */

export function BankNotice({ kase }: { kase: CaseState }) {
  const [copied, setCopied] = useState(false);
  const v = liabilityFor(kase.consent);
  const when = new Date(kase.incidentAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const letter = `To
The Branch Manager
[Bank name and branch]

Subject: Written notification of ${kase.consent === "unauthorised" ? "an unauthorised" : "a fraudulent"} transaction on account [account number]

Sir or Madam,

I am giving you written notice that ${formatINR(kase.amount)} left my account on ${when} by ${ROUTE_LABEL[kase.route]}.

${
  kase.consent === "unauthorised"
    ? "I did not authorise this transaction. I did not knowingly share any OTP, PIN or password. I am notifying you within the period specified in RBI circular RBI/2017-18/15 dated 6 July 2017 and I claim zero liability under that circular. I request that the amount be re-credited to my account within 10 working days of this notification, as required by that circular."
    : "I made this transfer after being deliberately misled about the identity and purpose of the recipient. I request that you raise a freeze request with the beneficiary bank immediately and confirm to me in writing what action has been taken."
}

I have reported this to the National Cyber Crime Reporting Portal${kase.ackNumber ? ` under acknowledgement number ${kase.ackNumber}` : ""}.

Please acknowledge receipt of this notification in writing, with the date and time it was received.

Yours faithfully,
[Your name]
[Account number]
[Contact number and email]
[Date]`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Send this by email to your bank, not just over the phone. The timestamp on
        the email is what proves when you told them.
        {v.deadlineLabel && (
          <>
            {" "}
            <strong style={{ color: "var(--ink)" }}>{v.deadlineLabel}.</strong>
          </>
        )}
      </p>

      <div className="mt-3 flex items-center justify-end">
        <button type="button" onClick={copy} className="btn btn-ghost !px-2 !py-1 text-xs">
          {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy letter"}
        </button>
      </div>
      <pre
        className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap rounded-[10px] p-4 text-[13.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--ink)" }}
      >
        {letter}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export function EvidenceList() {
  const [got, setGot] = useState<string[]>([]);

  return (
    <div>
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Scammers delete accounts within hours. Capture these now, before you do
        anything else with the phone.
      </p>

      <ul className="mt-4 space-y-1">
        {EVIDENCE.map((e) => {
          const on = got.includes(e.id);
          return (
            <li key={e.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setGot((g) => (g.includes(e.id) ? g.filter((x) => x !== e.id) : [...g, e.id]))
                }
                className="btn w-full !justify-start gap-3 !rounded-[10px] px-3 py-3 text-left"
                style={{ background: on ? "var(--ok-soft)" : "transparent" }}
              >
                {on ? (
                  <CheckCircle
                    size={19}
                    weight="fill"
                    className="shrink-0"
                    style={{ color: "var(--ok)" }}
                  />
                ) : (
                  <Circle size={19} className="shrink-0" style={{ color: "var(--ink-4)" }} />
                )}
                <span className="min-w-0">
                  <span
                    className="block text-[14.5px] font-medium leading-snug"
                    style={{ color: "var(--ink)" }}
                  >
                    {e.label}
                  </span>
                  <span
                    className="mt-0.5 block whitespace-normal text-[13px] leading-snug"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {e.note}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p
        className="mt-3 num text-[13px]"
        style={{ color: got.length === EVIDENCE.length ? "var(--ok)" : "var(--ink-3)" }}
        aria-live="polite"
      >
        {got.length} of {EVIDENCE.length} saved
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FIR guidance                                                        */
/* ------------------------------------------------------------------ */

export function FirGuide({ amount }: { amount: number }) {
  return (
    <div className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
      <p>
        An FIR is what gives an investigating officer authority to pursue the
        account holders. For {formatINR(amount)} it is worth doing.
      </p>

      <ol className="mt-4 space-y-3">
        {[
          {
            t: "Go to your nearest police station or cyber cell",
            d: "You can file at any station. They cannot refuse on the ground that the fraud happened elsewhere, because zero-FIR applies.",
          },
          {
            t: "Carry your NCRP acknowledgement number",
            d: "Printed, if you can. It links the FIR to the freeze request already in the system.",
          },
          {
            t: "Carry the evidence you saved",
            d: "Transaction reference, bank alert, screenshots of the chat, and any numbers or UPI IDs.",
          },
          {
            t: "Ask for the FIR number and the investigating officer's name",
            d: "Write both down before you leave. Without a name you have nobody to follow up with.",
          },
        ].map((s, i) => (
          <li key={s.t} className="flex gap-3">
            <span
              className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {i + 1}
            </span>
            <span>
              <span className="block font-medium" style={{ color: "var(--ink)" }}>
                {s.t}
              </span>
              <span className="mt-0.5 block text-[13.5px]" style={{ color: "var(--ink-3)" }}>
                {s.d}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p
        className="mt-4 flex items-start gap-2 text-[13px] leading-snug"
        style={{ color: "var(--ink-4)" }}
      >
        <MapPin size={14} className="mt-px shrink-0" />
        A real build would look up your nearest cyber cell here. This prototype
        does not have location access and does not fake one.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* What actually happens next                                          */
/* ------------------------------------------------------------------ */

export function StageMachine({
  elapsedMin,
  done,
}: {
  elapsedMin: number;
  done: ActionId[];
}) {
  const progress = stageProgress(elapsedMin, done);

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="stages-heading">
      <h2 id="stages-heading" className="text-[15px] font-semibold tracking-tight">
        What happens next
      </h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
        The part nobody explains. Every stage has an owner, so you know who to
        chase and when they are late.
      </p>

      <ol className="mt-5">
        {STAGES.map((s, i) => {
          const state = progress[s.key];
          const tone =
            state === "done" ? "var(--ok)" : state === "active" ? "var(--accent)" : "var(--ink-4)";
          return (
            <li
              key={s.key}
              className="grid grid-cols-[auto_1fr] gap-x-3 pb-5 last:pb-0"
            >
              {/* rail */}
              <div className="flex flex-col items-center">
                <span
                  className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full"
                  style={{
                    background: state === "waiting" ? "var(--surface-2)" : tone,
                    border: `2px solid ${state === "waiting" ? "var(--line-strong)" : tone}`,
                  }}
                >
                  {state === "done" && (
                    <Check size={10} weight="bold" color="var(--surface-2)" />
                  )}
                  {state === "active" && (
                    <span
                      className="pulse-ring absolute inset-0 rounded-full"
                      style={{ background: tone }}
                    />
                  )}
                </span>
                {i < STAGES.length - 1 && (
                  <span
                    className="mt-1 w-[2px] flex-1"
                    style={{
                      background: state === "done" ? "var(--ok)" : "var(--line)",
                      minHeight: "2rem",
                    }}
                  />
                )}
              </div>

              <div className="-mt-0.5 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3
                    className="text-[14.5px] font-medium leading-snug"
                    style={{ color: state === "waiting" ? "var(--ink-3)" : "var(--ink)" }}
                  >
                    {s.name}
                  </h3>
                  {state === "active" && (
                    <span
                      className="chip !py-0 !text-[10.5px]"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      in progress
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
                  {s.owner} · typically {s.typical.toLowerCase()}
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {s.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p
        className="mt-4 flex items-start gap-2 text-xs leading-snug"
        style={{ color: "var(--ink-4)", borderTop: "1px solid var(--line)", paddingTop: "0.85rem" }}
      >
        <Info size={13} className="mt-px shrink-0" />
        Timings are typical ranges described publicly, not guarantees, and this
        prototype is not connected to any live case system.
      </p>
    </section>
  );
}
