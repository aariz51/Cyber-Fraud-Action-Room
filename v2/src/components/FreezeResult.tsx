"use client";

import { useState } from "react";
import {
  bankLetter,
  rtiDraft,
  type FreezeFacts,
  type LegalityResult,
} from "@/lib/legality";
import { formatINR } from "@/lib/recovery";
import {
  ArrowLeft,
  Copy,
  Check,
  Gavel,
  Scales,
  Printer,
  Warning,
} from "@phosphor-icons/react";

const STRENGTH_TONE = {
  strong: "ok",
  contested: "warn",
  weak: "ink-3",
} as const;

export function FreezeResult({
  facts,
  result,
  onBack,
}: {
  facts: FreezeFacts;
  result: LegalityResult;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"position" | "letter" | "rti">("position");
  const tone = STRENGTH_TONE[result.strength];

  return (
    <div>
      <button type="button" onClick={onBack} className="btn btn-ghost no-print !px-2 !py-1.5 text-[13.5px]">
        <ArrowLeft size={15} weight="bold" />
        Change my answers
      </button>

      {/* Verdict */}
      <section className="panel mt-4 p-5 sm:p-6" aria-labelledby="verdict">
        <span
          className="chip"
          style={{
            background: result.strength === "weak" ? "var(--surface-3)" : `var(--${tone}-soft)`,
            color: `var(--${tone})`,
          }}
        >
          <Scales size={13} weight="fill" />
          {result.strength === "strong"
            ? "Strong grounds"
            : result.strength === "contested"
              ? "Contested"
              : "Limited grounds"}
        </span>

        <h1
          id="verdict"
          className="mt-3 text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]"
        >
          {result.headline}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {result.summary}
        </p>

        {result.disproportionateAmount !== null && result.disproportionateAmount > 0 && (
          <div
            className="mt-5 rounded-[10px] p-4"
            style={{ background: "var(--warn-soft)" }}
          >
            <p className="text-[13px] font-medium" style={{ color: "var(--warn)" }}>
              Held with no stated connection to the case
            </p>
            <p
              className="num mt-1 text-[30px] font-semibold leading-none"
              style={{ color: "var(--warn)" }}
            >
              {formatINR(result.disproportionateAmount)}
            </p>
            <p className="mt-2 text-[13.5px] leading-snug" style={{ color: "var(--ink-2)" }}>
              Your balance is {formatINR(facts.balanceHeld)} and the disputed sum is{" "}
              {formatINR(facts.disputedAmount)}. Ask for this difference back now,
              separately from the rest of the dispute.
            </p>
          </div>
        )}

        <div
          className="mt-5 flex items-start gap-2 pt-4 text-[13.5px] leading-relaxed"
          style={{ borderTop: "1px solid var(--line)", color: "var(--ink-2)" }}
        >
          <Gavel size={15} className="mt-0.5 shrink-0" style={{ color: "var(--ink-3)" }} />
          <span>
            <strong style={{ color: "var(--ink)" }}>{result.jurisdiction.court}.</strong>{" "}
            {result.jurisdiction.posture}
          </span>
        </div>
      </section>

      {/* Tabs */}
      <div
        className="no-print mt-6 flex gap-1 rounded-full p-1"
        style={{ background: "var(--surface-sunken)" }}
        role="tablist"
        aria-label="Result sections"
      >
        {(
          [
            ["position", "Your position"],
            ["letter", "Letter to the bank"],
            ["rti", "RTI application"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className="flex-1 rounded-full px-3 py-2 text-[13.5px] font-medium transition-colors"
            style={{
              background: tab === k ? "var(--surface-2)" : "transparent",
              color: tab === k ? "var(--ink)" : "var(--ink-3)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "position" && (
        <div className="rise mt-5 space-y-5">
          <section className="panel p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">
              What is wrong with it
            </h2>
            {result.grounds.length === 0 ? (
              <p className="mt-3 text-[14px]" style={{ color: "var(--ink-2)" }}>
                Nothing you described is clearly defective. Establish the facts in
                writing first, using the letter in the next tab.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {result.grounds.map((g, i) => (
                  <li
                    key={g.title}
                    className="grid grid-cols-[auto_1fr] gap-x-3"
                    style={
                      i > 0
                        ? { borderTop: "1px solid var(--line)", paddingTop: "1rem" }
                        : undefined
                    }
                  >
                    <span
                      className="num mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[14.5px] font-medium leading-snug">{g.title}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                        {g.body}
                      </p>
                      {g.citation && (
                        <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
                          {g.citation.ref}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="panel p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">What to do</h2>
            <ol className="mt-4 space-y-3.5">
              {result.actions.map((a, i) => (
                <li key={a.title} className="flex gap-3">
                  <span
                    className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-medium leading-snug">
                      {a.title}
                    </span>
                    <span
                      className="mt-0.5 block text-[13.5px] leading-relaxed"
                      style={{ color: "var(--ink-2)" }}
                    >
                      {a.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">
              The law this rests on
            </h2>
            <ul className="mt-4 space-y-4">
              {result.citations.map((c, i) => (
                <li
                  key={c.ref}
                  style={
                    i > 0
                      ? { borderTop: "1px solid var(--line)", paddingTop: "1rem" }
                      : undefined
                  }
                >
                  <h3 className="text-[14px] font-semibold leading-snug">{c.ref}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                    {c.holding}
                  </p>
                  <p className="mt-1 text-[12.5px]" style={{ color: "var(--ink-4)" }}>
                    {c.scope}
                  </p>
                </li>
              ))}
            </ul>

            <p
              className="mt-5 flex items-start gap-2 pt-4 text-xs leading-snug"
              style={{ borderTop: "1px solid var(--line)", color: "var(--ink-4)" }}
            >
              <Warning size={13} className="mt-px shrink-0" />
              Case references are summarised for a general reader and are not a
              substitute for reading the judgments. Courts are actively split on
              whether police may debit-freeze at all, so verify the current position
              in your state before relying on any of it.
            </p>
          </section>
        </div>
      )}

      {tab === "letter" && (
        <Document
          key="letter"
          text={bankLetter(facts, result)}
          caption="Send this by email so the timestamp is recorded. Replace everything in square brackets first."
        />
      )}

      {tab === "rti" && (
        <Document
          key="rti"
          text={rtiDraft(facts)}
          caption="An RTI costs Rs 10. A reply confirming no case is registered against you is the single most effective document for getting a freeze lifted."
        />
      )}
    </div>
  );
}

function Document({ text, caption }: { text: string; caption: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rise mt-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-[52ch] text-[13.5px] leading-snug" style={{ color: "var(--ink-2)" }}>
          {caption}
        </p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => window.print()} className="btn btn-ghost !px-2.5 !py-1.5 text-xs">
            <Printer size={14} />
            Print
          </button>
          <button type="button" onClick={copy} className="btn btn-secondary !px-3 !py-1.5 text-xs">
            {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <pre
        className="panel mt-3 overflow-auto whitespace-pre-wrap p-5 text-[13.5px] leading-relaxed"
        style={{ color: "var(--ink)" }}
      >
        {text}
      </pre>
    </div>
  );
}
