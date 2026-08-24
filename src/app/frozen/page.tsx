"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { FreezeResult } from "@/components/FreezeResult";
import {
  assessFreeze,
  STATES,
  type FreezeFacts,
  type FreezeScope,
  type Section,
  type YesNoUnknown,
} from "@/lib/legality";
import { formatINR } from "@/lib/recovery";
import { ArrowLeft, ArrowRight, Check, Snowflake } from "@phosphor-icons/react";

/**
 * The frozen-account journey.
 *
 * A person who received one tainted payment can have their entire account locked
 * for months, with no notice and no reachable officer. The law on this is clear
 * in parts and genuinely contested in others, so the engine reports both.
 */
export default function FrozenPage() {
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [state, setState] = useState("");
  const [days, setDays] = useState("");
  const [balance, setBalance] = useState("");
  const [disputed, setDisputed] = useState("");
  const [section, setSection] = useState<Section | null>(null);
  const [scope, setScope] = useState<FreezeScope | null>(null);
  const [magistrate, setMagistrate] = useState<YesNoUnknown | null>(null);
  const [notified, setNotified] = useState<YesNoUnknown | null>(null);

  const num = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;

  const steps = [
    { valid: state !== "" && num(days) > 0 },
    { valid: num(balance) > 0 && disputed !== "" },
    { valid: section !== null },
    { valid: scope !== null },
    { valid: magistrate !== null && notified !== null },
  ];

  const facts: FreezeFacts = useMemo(
    () => ({
      state,
      section: section ?? "unknown",
      scope: scope ?? "unknown",
      magistrateInformed: magistrate ?? "unknown",
      notifiedWithReasons: notified ?? "unknown",
      daysSinceFreeze: num(days),
      balanceHeld: num(balance),
      disputedAmount: num(disputed),
    }),
    [state, section, scope, magistrate, notified, days, balance, disputed]
  );

  const result = useMemo(() => assessFreeze(facts), [facts]);

  if (showResult) {
    return (
      <>
        <SiteHeader minimal />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
          <FreezeResult
            facts={facts}
            result={result}
            onBack={() => setShowResult(false)}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader minimal />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8">
        <div className="flex items-center gap-2.5">
          <Snowflake size={20} weight="duotone" style={{ color: "var(--accent)" }} />
          <h1 className="text-[15px] font-semibold tracking-tight">
            Is this freeze lawful?
          </h1>
        </div>

        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          {steps.map((s, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                background: i <= step ? "var(--accent)" : "var(--surface-sunken)",
                transition: "background-color 240ms var(--ease-out-strong)",
              }}
            />
          ))}
        </div>
        <p className="mt-3 text-[13px]" style={{ color: "var(--ink-3)" }}>
          Step {step + 1} of {steps.length}
        </p>

        <div key={step} className="rise mt-7">
          {step === 0 && (
            <fieldset>
              <legend className="text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">
                Where are you, and how long has it been?
              </legend>
              <p className="mt-2 text-[15px]" style={{ color: "var(--ink-2)" }}>
                High Courts disagree on this right now, so your state changes the
                answer.
              </p>

              <label htmlFor="state" className="mt-7 block text-sm font-medium" style={{ color: "var(--ink-2)" }}>
                Your state
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="field mt-2"
              >
                <option value="">Select a state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label htmlFor="days" className="mt-5 block text-sm font-medium" style={{ color: "var(--ink-2)" }}>
                Days since the account was frozen
              </label>
              <input
                id="days"
                inputMode="numeric"
                value={days}
                onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
                className="field num mt-2"
                placeholder="e.g. 45"
              />
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">
                How much is held, and how much is actually disputed?
              </legend>
              <p className="mt-2 text-[15px]" style={{ color: "var(--ink-2)" }}>
                In most of these cases a small tainted credit locks a much larger
                balance. That gap is your strongest argument.
              </p>

              <label htmlFor="balance" className="mt-7 block text-sm font-medium" style={{ color: "var(--ink-2)" }}>
                Total balance frozen
              </label>
              <input
                id="balance"
                inputMode="numeric"
                value={balance}
                onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ""))}
                className="field num mt-2"
                placeholder="0"
              />
              {num(balance) > 0 && (
                <p className="num mt-1.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
                  {formatINR(num(balance))}
                </p>
              )}

              <label htmlFor="disputed" className="mt-5 block text-sm font-medium" style={{ color: "var(--ink-2)" }}>
                Amount the complaint is actually about
              </label>
              <input
                id="disputed"
                inputMode="numeric"
                value={disputed}
                onChange={(e) => setDisputed(e.target.value.replace(/[^0-9]/g, ""))}
                className="field num mt-2"
                placeholder="0"
                aria-describedby="disputed-help"
              />
              <p id="disputed-help" className="mt-1.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
                {disputed !== "" ? formatINR(num(disputed)) : "Enter 0 if nobody has told you."}
              </p>
            </fieldset>
          )}

          {step === 2 && (
            <Radio
              legend="What did the bank say the freeze was under?"
              help="Ask them if you do not know. It is the first thing to establish, and often they cannot answer."
              options={[
                { key: "94", label: "Section 94 BNSS", hint: "Formerly section 91 CrPC" },
                { key: "106", label: "Section 106 BNSS", hint: "Formerly section 102 CrPC" },
                { key: "107", label: "Section 107 BNSS", hint: "Attachment, ordered by a Magistrate" },
                { key: "unknown", label: "They did not tell me", hint: "The most common answer" },
              ]}
              value={section}
              onChange={(v) => setSection(v as Section)}
            />
          )}

          {step === 3 && (
            <Radio
              legend="What exactly was blocked?"
              help="Courts have held that only the disputed amount should be under lien."
              options={[
                { key: "whole", label: "My entire account", hint: "Nothing moves at all" },
                { key: "disputed", label: "Only the disputed amount", hint: "The rest still works" },
                { key: "unknown", label: "I am not sure", hint: "Check whether any debit succeeds" },
              ]}
              value={scope}
              onChange={(v) => setScope(v as FreezeScope)}
            />
          )}

          {step === 4 && (
            <div className="space-y-9">
              <Radio
                legend="Were you told a Magistrate was informed?"
                help="Section 106(3) requires the officer to report the seizure forthwith."
                options={[
                  { key: "yes", label: "Yes, with a reference" },
                  { key: "no", label: "No, and they confirmed it was not" },
                  { key: "unknown", label: "Nobody has said either way" },
                ]}
                value={magistrate}
                onChange={(v) => setMagistrate(v as YesNoUnknown)}
                small
              />
              <Radio
                legend="Were you given written reasons and a timeline?"
                help="A one-line note saying the cyber cell asked for it does not count."
                options={[
                  { key: "yes", label: "Yes, in writing" },
                  { key: "no", label: "No, nothing in writing" },
                  { key: "unknown", label: "Only a verbal explanation" },
                ]}
                value={notified}
                onChange={(v) => setNotified(v as YesNoUnknown)}
                small
              />
            </div>
          )}
        </div>

        <div className="mt-9 flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn btn-secondary px-4 py-3"
            >
              <ArrowLeft size={16} weight="bold" />
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!steps[step].valid}
            onClick={() => (step < steps.length - 1 ? setStep((s) => s + 1) : setShowResult(true))}
            className="btn btn-primary ml-auto px-5 py-3.5 text-[15px]"
          >
            {step === steps.length - 1 ? "Get my position" : "Continue"}
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>

        <p className="mt-8 text-[13px] leading-relaxed" style={{ color: "var(--ink-4)" }}>
          This produces general information about published law, not legal advice.
          Have a lawyer review anything you send if the amount matters to you.
        </p>
      </main>
    </>
  );
}

function Radio({
  legend,
  help,
  options,
  value,
  onChange,
  small = false,
}: {
  legend: string;
  help: string;
  options: { key: string; label: string; hint?: string }[];
  value: string | null;
  onChange: (v: string) => void;
  small?: boolean;
}) {
  return (
    <fieldset>
      <legend
        className={
          small
            ? "text-[17px] font-semibold leading-snug tracking-tight"
            : "text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]"
        }
      >
        {legend}
      </legend>
      <p className={`mt-1.5 ${small ? "text-[13.5px]" : "text-[15px]"}`} style={{ color: "var(--ink-2)" }}>
        {help}
      </p>

      <div className={`${small ? "mt-4" : "mt-7"} space-y-2.5`}>
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.key)}
              className="btn w-full !justify-start gap-3 px-4 py-3.5 text-left"
              style={{
                background: on ? "var(--accent-soft)" : "var(--surface-2)",
                border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                color: "var(--ink)",
              }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                  border: `1.5px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                  background: on ? "var(--accent)" : "transparent",
                }}
              >
                {on && <Check size={12} weight="bold" color="var(--accent-ink)" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-medium leading-snug">{o.label}</span>
                {o.hint && (
                  <span
                    className="mt-0.5 block whitespace-normal text-[13px] leading-snug"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {o.hint}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
