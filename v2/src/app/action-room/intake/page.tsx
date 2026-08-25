"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCase } from "@/lib/store";
import { CONSENT_LABEL, ROUTE_LABEL, type Consent, type FraudRoute } from "@/lib/case";
import { formatINR } from "@/lib/recovery";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";

/**
 * Triage. Four questions, one screen each, large targets.
 *
 * The current official flow opens with a long form while the clock runs. We ask
 * only what changes the advice: how much, how it left, when, and crucially
 * whether the victim authorised it, because that last one decides which legal
 * protection applies.
 */

const WHEN_OPTIONS: { key: string; label: string; minutes: number; hint: string }[] = [
  { key: "now", label: "Just now", minutes: 2, hint: "Within the last few minutes" },
  { key: "hour", label: "Under an hour ago", minutes: 35, hint: "Still the best window" },
  { key: "today", label: "Earlier today", minutes: 420, hint: "Several hours ago" },
  { key: "yesterday", label: "Yesterday", minutes: 1800, hint: "About a day ago" },
  { key: "week", label: "A few days ago", minutes: 5760, hint: "Two to five days" },
  { key: "older", label: "Over a week ago", minutes: 14400, hint: "Report it anyway" },
];

const AMOUNT_CHIPS = [5000, 25000, 50000, 200000];

export default function ActPage() {
  const router = useRouter();
  const { create } = useCase();

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState<string>("");
  const [route, setRoute] = useState<FraudRoute | null>(null);
  const [when, setWhen] = useState<string | null>(null);
  const [consent, setConsent] = useState<Consent | null>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const amountNum = useMemo(() => {
    const n = Number(amount.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const steps = [
    { id: "amount", valid: amountNum > 0 },
    { id: "route", valid: route !== null },
    { id: "when", valid: when !== null },
    { id: "consent", valid: consent !== null },
  ];

  function next() {
    if (!steps[step].valid) return;
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    const chosen = WHEN_OPTIONS.find((w) => w.key === when)!;
    create({
      amount: amountNum,
      route: route!,
      consent: consent!,
      incidentAt: Date.now() - chosen.minutes * 60000,
      narrative: "",
      state: "",
    });
    router.push("/action-room/case");
  }

  return (
    <main className="app-page app-page-narrow">
        {/* progress */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {steps.map((s, i) => (
            <div
              key={s.id}
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
              <legend className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
                How much left your account?
              </legend>
              <p className="mt-2 text-[15px]" style={{ color: "var(--ink-2)" }}>
                A rough figure is fine. You can correct it later.
              </p>

              <label
                htmlFor="amount"
                className="mt-7 block text-sm font-medium"
                style={{ color: "var(--ink-2)" }}
              >
                Amount in rupees
              </label>
              <div className="relative mt-2">
                <span
                  className="num pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl"
                  style={{ color: "var(--ink-3)" }}
                >
                  ₹
                </span>
                <input
                  id="amount"
                  inputMode="numeric"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                  className="field num !py-4 !pl-9 !text-xl"
                  placeholder="0"
                  aria-describedby="amount-help"
                />
              </div>
              <p id="amount-help" className="mt-2 text-[13px]" style={{ color: "var(--ink-3)" }}>
                {amountNum > 0 ? formatINR(amountNum) : "Enter the total that was taken."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {AMOUNT_CHIPS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className="btn btn-secondary !rounded-full px-3.5 py-2 text-[13px]"
                  >
                    {formatINR(a)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <Choice
              legend="How did the money leave?"
              help="This tells us which bank systems are involved."
              options={(Object.keys(ROUTE_LABEL) as FraudRoute[]).map((k) => ({
                key: k,
                label: ROUTE_LABEL[k],
              }))}
              value={route}
              onChange={(v) => setRoute(v as FraudRoute)}
            />
          )}

          {step === 2 && (
            <Choice
              legend="When did it happen?"
              help="This sets your clock. Be as accurate as you can."
              options={WHEN_OPTIONS.map((w) => ({
                key: w.key,
                label: w.label,
                hint: w.hint,
              }))}
              value={when}
              onChange={setWhen}
            />
          )}

          {step === 3 && (
            <Choice
              legend="Did you approve the payment?"
              help="This decides which protection you can rely on, so it matters more than it sounds."
              options={(Object.keys(CONSENT_LABEL) as Consent[]).map((k) => ({
                key: k,
                label: CONSENT_LABEL[k],
                hint:
                  k === "unauthorised"
                    ? "Card used without you, account accessed, money vanished"
                    : k === "deceived"
                      ? "You sent it yourself after being tricked or pressured"
                      : "Pick this if you genuinely are not certain",
              }))}
              value={consent}
              onChange={(v) => setConsent(v as Consent)}
            />
          )}
        </div>

        <p ref={liveRef} className="sr-only" aria-live="polite" />

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
            onClick={next}
            disabled={!steps[step].valid}
            className="btn btn-primary ml-auto px-5 py-3.5 text-[15px]"
          >
            {step === steps.length - 1 ? "Open my action room" : "Continue"}
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>

        <p className="mt-8 text-[13px] leading-relaxed" style={{ color: "var(--ink-4)" }}>
          Nothing you enter here leaves your browser. This prototype has no server
          storing your answers and no account to sign into.
        </p>
    </main>
  );
}

function Choice({
  legend,
  help,
  options,
  value,
  onChange,
}: {
  legend: string;
  help: string;
  options: { key: string; label: string; hint?: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
        {legend}
      </legend>
      <p className="mt-2 text-[15px]" style={{ color: "var(--ink-2)" }}>
        {help}
      </p>

      <div className="mt-7 space-y-2.5">
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.key)}
              className="btn w-full !justify-start gap-3 px-4 py-4 text-left"
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
                <span className="block text-[15px] font-medium leading-snug">
                  {o.label}
                </span>
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
