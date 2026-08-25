"use client";

import { describeLayers, layerSnapshot } from "@/lib/layers";
import { formatINR } from "@/lib/recovery";
import { ArrowRight, Bank, Info } from "@phosphor-icons/react";

/**
 * The Layer Map.
 *
 * Stolen money is forwarded through a chain of mule accounts. Layer 1 is the one
 * banks hold I4C lists for, so it is the only layer that is reliably catchable.
 * Nobody shows a victim this, which is why "act fast" never lands as advice.
 *
 * Transit timings are illustrative, and the panel says so on screen.
 */
export function LayerMap({
  elapsedMin,
  amount,
}: {
  elapsedMin: number;
  amount: number;
}) {
  const snap = layerSnapshot(elapsedMin);
  const sentence = describeLayers(elapsedMin);

  const rows = [
    ...snap.layers.map((l) => ({
      key: `L${l.layer}`,
      label: l.label,
      detail: l.detail,
      share: l.share,
      reach: l.reachability,
      gone: false,
    })),
    {
      key: "out",
      label: "Withdrawn",
      detail: "Taken out as cash, moved to wallets or converted. Effectively unrecoverable.",
      share: snap.cashedOut,
      reach: 0,
      gone: true,
    },
  ];

  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="layer-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="layer-heading"
            className="flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--ink-3)" }}
          >
            <Bank size={14} weight="bold" />
            Where your money is right now
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
            {sentence}
          </p>
        </div>
        <span
          className="chip shrink-0"
          style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
        >
          {snap.accountsInvolved} account{snap.accountsInvolved === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="mt-5 space-y-2.5">
        {rows.map((r) => {
          const pct = Math.round(r.share * 100);
          const rupees = amount * r.share;
          const dim = r.share < 0.005;
          return (
            <li key={r.key} className={dim ? "opacity-35" : ""}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: r.gone ? "var(--crit)" : "var(--ink-2)" }}
                >
                  {r.label}
                  {!r.gone && r.reach >= 0.9 && (
                    <span
                      className="chip !px-1.5 !py-0 !text-[10px]"
                      style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
                    >
                      catchable
                    </span>
                  )}
                </span>
                <span className="num text-[13px]" style={{ color: "var(--ink-3)" }}>
                  {pct < 1 && r.share > 0 ? "under 1" : pct}% · {formatINR(rupees)}
                </span>
              </div>

              {/* magnitude bar, 4px rounded ends, anchored to a shared baseline */}
              <div
                className="mt-1.5 h-[7px] w-full overflow-hidden rounded-full"
                style={{ background: "var(--surface-sunken)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(r.share * 100, r.share > 0 ? 1.5 : 0)}%`,
                    background: r.gone
                      ? "var(--crit)"
                      : r.reach >= 0.9
                        ? "var(--ok)"
                        : r.reach >= 0.5
                          ? "var(--warn)"
                          : "var(--ink-4)",
                    transition: "width 600ms var(--ease-in-out-strong)",
                  }}
                />
              </div>

              <p className="mt-1 text-xs leading-snug" style={{ color: "var(--ink-4)" }}>
                {r.detail}
              </p>
            </li>
          );
        })}
      </ul>

      <p
        className="mt-4 flex items-start gap-1.5 text-xs leading-snug"
        style={{ color: "var(--ink-4)", borderTop: "1px solid var(--line)", paddingTop: "0.75rem" }}
      >
        <Info size={13} className="mt-px shrink-0" />
        <span>
          Layer transit times here are illustrative. Real mule networks vary and
          their timing is not published. The shape, fast fan-out then cash-out
          within a day, matches how these networks are publicly described.
        </span>
      </p>

      <p className="mt-2.5 flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-3)" }}>
        <ArrowRight size={12} weight="bold" />
        Freezing works best at Layer 1. That is what calling 1930 goes after.
      </p>
    </section>
  );
}
