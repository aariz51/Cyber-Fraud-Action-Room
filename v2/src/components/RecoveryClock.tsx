"use client";

import { DecayCurve } from "./DecayCurve";
import {
  decayOver,
  freezeProbability,
  humanElapsed,
  URGENCY_COPY,
  urgencyOf,
} from "@/lib/recovery";
import { Warning, Clock, TrendDown } from "@phosphor-icons/react";

/**
 * The Recovery Clock. This is the mechanism the whole product is built around:
 * the state already knows recovery odds collapse within the first hour, and it
 * never shows the citizen that clock.
 */
export function RecoveryClock({ elapsedMin }: { elapsedMin: number }) {
  const p = freezeProbability(elapsedMin);
  const urgency = urgencyOf(elapsedMin);
  const tone: "ok" | "warn" | "crit" =
    urgency === "critical" ? "ok" : urgency === "high" ? "warn" : "crit";
  const toneVar = `var(--${tone})`;
  const copy = URGENCY_COPY[urgency];

  const lost10 = decayOver(elapsedMin, 10) * 100;
  const lost60 = decayOver(elapsedMin, 60) * 100;

  return (
    <section
      className="panel p-5 sm:p-6"
      aria-labelledby="clock-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="clock-heading"
            className="flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--ink-3)" }}
          >
            <Clock size={14} weight="bold" />
            Time since the money left
          </h2>
          <p
            className="num mt-1 text-[22px] font-semibold leading-none sm:text-2xl"
            style={{ color: "var(--ink)" }}
            aria-live="polite"
          >
            {humanElapsed(elapsedMin)}
          </p>
        </div>

        <span
          className="chip shrink-0"
          style={{ background: `var(--${tone}-soft)`, color: toneVar }}
        >
          <Warning size={12} weight="fill" />
          {copy.title}
        </span>
      </div>

      <div
        className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1"
        style={{ borderTop: "1px solid var(--line)", paddingTop: "1.25rem" }}
      >
        <div>
          <p
            className="num text-[54px] font-semibold leading-[0.9] tracking-tight sm:text-[64px]"
            style={{ color: toneVar }}
            aria-live="polite"
          >
            {Math.round(p * 100)}
            <span className="text-[28px] sm:text-[32px]">%</span>
          </p>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--ink-2)" }}>
            chance the money can still be frozen
          </p>
        </div>

        <p
          className="ml-auto flex items-center gap-1.5 text-[13px]"
          style={{ color: "var(--ink-3)" }}
        >
          <TrendDown size={15} weight="bold" style={{ color: toneVar }} />
          <span>
            Falling{" "}
            <span className="num font-semibold" style={{ color: "var(--ink-2)" }}>
              {lost10 < 0.1 ? "under 0.1" : lost10.toFixed(1)}
            </span>{" "}
            points every 10 minutes
            {lost60 > 0.5 && (
              <>
                {", "}
                <span className="num font-semibold" style={{ color: "var(--ink-2)" }}>
                  {lost60.toFixed(1)}
                </span>{" "}
                this hour
              </>
            )}
          </span>
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
        {copy.line}
      </p>

      <div className="mt-4" style={{ borderTop: "1px solid var(--line)", paddingTop: "0.75rem" }}>
        <DecayCurve nowMin={elapsedMin} tone={tone} />
      </div>
    </section>
  );
}
