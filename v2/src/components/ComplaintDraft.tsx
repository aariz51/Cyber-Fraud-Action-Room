"use client";

import { useState } from "react";
import { Copy, Check, Sparkle, ArrowClockwise, Warning } from "@phosphor-icons/react";
import type { CaseState } from "@/lib/store";

/**
 * The complaint draft.
 *
 * The victim narrates what happened in whatever order it comes out, and the
 * model turns it into the factual chronology a police officer can act on. The
 * source of the text is always labelled, because a template and a model are not
 * the same thing and the reader deserves to know which one they got.
 */
export function ComplaintDraft({
  kase,
  elapsedMin,
  onNarrative,
}: {
  kase: CaseState;
  elapsedMin: number;
  onNarrative: (v: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [source, setSource] = useState<"openai" | "template" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: kase.amount,
          route: kase.route,
          consent: kase.consent,
          narrative: kase.narrative,
          elapsedMin,
          incidentAt: kase.incidentAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate the draft");
      setDraft(data.text);
      setSource(data.source);
      setNote(data.note ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <label
        htmlFor="narrative"
        className="block text-sm font-medium"
        style={{ color: "var(--ink-2)" }}
      >
        Tell us what happened, in any order
      </label>
      <p className="mt-1 text-[13px]" style={{ color: "var(--ink-3)" }}>
        Do not worry about wording. That is the part we handle.
      </p>
      <textarea
        id="narrative"
        rows={4}
        value={kase.narrative}
        onChange={(e) => onNarrative(e.target.value)}
        className="field mt-2 resize-y text-[15px] leading-relaxed"
        placeholder="Someone called saying my electricity would be cut off, asked me to install an app to pay the bill, and after that the money went out on its own."
      />

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="btn btn-primary mt-3 px-4 py-3"
      >
        {loading ? (
          <ArrowClockwise size={16} weight="bold" className="animate-spin" />
        ) : (
          <Sparkle size={16} weight="fill" />
        )}
        {loading ? "Writing your complaint" : draft ? "Rewrite the complaint" : "Write my complaint"}
      </button>

      {loading && (
        <div className="mt-4 space-y-2" aria-hidden="true">
          {[100, 96, 88, 92, 60].map((w, i) => (
            <div
              key={i}
              className="h-3.5 rounded"
              style={{
                width: `${w}%`,
                background: "var(--surface-sunken)",
                animation: "skeleton 1.4s ease-in-out infinite",
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-[13.5px]"
          style={{ color: "var(--crit)" }}
        >
          <Warning size={15} weight="fill" className="mt-px shrink-0" />
          {error}
        </p>
      )}

      {draft && !loading && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="chip"
              style={{
                background: source === "openai" ? "var(--accent-soft)" : "var(--warn-soft)",
                color: source === "openai" ? "var(--accent)" : "var(--warn)",
              }}
            >
              {source === "openai" ? "Written by an OpenAI model" : "Built-in template"}
            </span>
            <button type="button" onClick={copy} className="btn btn-ghost !px-2 !py-1 text-xs">
              {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {note && (
            <p className="mt-2 text-xs leading-snug" style={{ color: "var(--ink-4)" }}>
              {note}
            </p>
          )}

          <textarea
            aria-label="Your complaint draft, editable"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={11}
            className="field mt-2.5 resize-y text-[14.5px] leading-relaxed"
          />

          <p className="mt-2 text-[13px] leading-snug" style={{ color: "var(--ink-3)" }}>
            Anything in square brackets still needs your input. Fill those in before
            you submit, then paste this into the complaint form at cybercrime.gov.in.
          </p>
        </div>
      )}

    </div>
  );
}
