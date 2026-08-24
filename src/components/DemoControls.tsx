"use client";

import { useCase } from "@/lib/store";
import { humanElapsed } from "@/lib/recovery";
import { FastForward, ArrowCounterClockwise, Play } from "@phosphor-icons/react";

/**
 * Time travel, for reviewers.
 *
 * The whole argument of this product is that recovery odds collapse over hours
 * and days. Nobody testing a prototype is going to sit and wait, so this shifts
 * the case clock forward. It is clearly labelled as a demo control and is the
 * only thing in the app that is not part of the real citizen journey.
 */
export function DemoControls() {
  const { kase, update, elapsedMin } = useCase();
  if (!kase) return null;

  const jumps: { label: string; min: number }[] = [
    { label: "+30 min", min: 30 },
    { label: "+6 hours", min: 360 },
    { label: "+3 days", min: 4320 },
  ];

  return (
    <section
      className="rounded-[16px] border border-dashed p-4"
      style={{ borderColor: "var(--line-strong)", background: "var(--surface-3)" }}
      aria-labelledby="demo-heading"
    >
      <h2
        id="demo-heading"
        className="flex items-center gap-1.5 text-[13px] font-medium"
        style={{ color: "var(--ink-3)" }}
      >
        <Play size={13} weight="fill" />
        Reviewer control, not part of the real journey
      </h2>
      <p className="mt-1.5 text-[13px] leading-snug" style={{ color: "var(--ink-2)" }}>
        Move the clock forward to watch the odds fall and the money move down the
        layers.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {jumps.map((j) => (
          <button
            key={j.label}
            type="button"
            onClick={() => update({ demoOffsetMin: kase.demoOffsetMin + j.min })}
            className="btn btn-secondary !rounded-full px-3 py-1.5 text-[13px]"
          >
            <FastForward size={13} weight="fill" />
            {j.label}
          </button>
        ))}
        {kase.demoOffsetMin !== 0 && (
          <button
            type="button"
            onClick={() => update({ demoOffsetMin: 0 })}
            className="btn btn-ghost !rounded-full px-3 py-1.5 text-[13px]"
          >
            <ArrowCounterClockwise size={13} weight="bold" />
            Reset
          </button>
        )}
      </div>

      {kase.demoOffsetMin !== 0 && (
        <p className="num mt-2.5 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
          Clock advanced by {humanElapsed(kase.demoOffsetMin)}. Showing{" "}
          {humanElapsed(elapsedMin)} elapsed.
        </p>
      )}
    </section>
  );
}
