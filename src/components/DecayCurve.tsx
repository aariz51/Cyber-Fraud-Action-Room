"use client";

import { useId, useMemo, useState } from "react";
import { ANCHORS, freezeProbability, humanElapsed } from "@/lib/recovery";

/**
 * Single-series decay curve: the chance the money can still be frozen, against
 * time since it left.
 *
 * Charting decisions, per the dataviz method:
 * - One series, so no legend. The title names it.
 * - One axis. Time is log-scaled because the collapse is front-loaded.
 * - The line itself is recessive neutral ink. The only saturated thing on the
 *   chart is the "you are here" marker, which carries the state.
 * - Published anchors are ticked and labelled, so a reader can see exactly which
 *   points are real figures and which part of the line is interpolation.
 * - Hover gives a crosshair and a readout. A table view is available for anyone
 *   who cannot use the chart.
 */

const W = 640;
const H = 230;
const PAD = { t: 16, r: 14, b: 36, l: 44 };
const T_MAX = 43200; // 30 days in minutes
const Y_MAX = 0.72;

const TICKS: { t: number; label: string }[] = [
  { t: 5, label: "5 min" },
  { t: 60, label: "1 hr" },
  { t: 360, label: "6 hr" },
  { t: 1440, label: "1 day" },
  { t: 10080, label: "7 days" },
  { t: 43200, label: "30 days" },
];

function sx(t: number): number {
  const k = Math.log(t + 1) / Math.log(T_MAX + 1);
  return PAD.l + k * (W - PAD.l - PAD.r);
}
function sy(p: number): number {
  const k = p / Y_MAX;
  return H - PAD.b - k * (H - PAD.t - PAD.b);
}
function invX(px: number): number {
  const k = (px - PAD.l) / (W - PAD.l - PAD.r);
  return Math.max(0, Math.exp(k * Math.log(T_MAX + 1)) - 1);
}

export function DecayCurve({
  nowMin,
  tone,
}: {
  nowMin: number;
  tone: "ok" | "warn" | "crit";
}) {
  const uid = useId();
  const [hoverT, setHoverT] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 220; i++) {
      const t = Math.exp((i / 220) * Math.log(T_MAX + 1)) - 1;
      pts.push(`${sx(t).toFixed(2)},${sy(freezeProbability(t)).toFixed(2)}`);
    }
    return `M ${pts.join(" L ")}`;
  }, []);

  const areaPath = useMemo(
    () => `${path} L ${sx(T_MAX).toFixed(2)},${(H - PAD.b).toFixed(2)} L ${sx(0).toFixed(2)},${(H - PAD.b).toFixed(2)} Z`,
    [path]
  );

  const clampedNow = Math.min(nowMin, T_MAX);
  const nowP = freezeProbability(clampedNow);
  const readT = hoverT ?? clampedNow;
  const readP = freezeProbability(readT);
  const toneVar = `var(--${tone})`;

  const published = ANCHORS.filter((a) => a.published);

  if (showTable) {
    return (
      <figure className="mt-1">
        <figcaption className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
            Chance the money can still be frozen
          </span>
          <button
            type="button"
            className="btn btn-ghost !px-2 !py-1 text-xs"
            onClick={() => setShowTable(false)}
          >
            Show chart
          </button>
        </figcaption>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr style={{ color: "var(--ink-3)" }}>
              <th className="pb-1.5 font-medium">Reported after</th>
              <th className="pb-1.5 font-medium">Freeze chance</th>
              <th className="pb-1.5 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="num">
            {ANCHORS.map((a) => (
              <tr key={a.t} style={{ borderTop: "1px solid var(--line)" }}>
                <td className="py-1.5">{a.t === 0 ? "immediately" : humanElapsed(a.t)}</td>
                <td className="py-1.5">{Math.round(a.p * 100)}%</td>
                <td className="py-1.5 font-sans text-xs" style={{ color: "var(--ink-3)" }}>
                  {a.published ? "published figure" : "interpolated"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    );
  }

  return (
    <figure className="mt-1">
      <figcaption className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
          Chance the money can still be frozen
        </span>
        <button
          type="button"
          className="btn btn-ghost !px-2 !py-1 text-xs"
          onClick={() => setShowTable(true)}
        >
          Show as table
        </button>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        style={{ overflow: "visible" }}
        role="img"
        aria-label={`Freeze probability decays from about 68 percent immediately to about 3 percent after 30 days. You are currently at ${Math.round(nowP * 100)} percent, ${humanElapsed(nowMin)} after the money left.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * W;
          if (x >= PAD.l && x <= W - PAD.r) setHoverT(invX(x));
        }}
        onPointerLeave={() => setHoverT(null)}
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* y grid, recessive */}
        {[0, 0.2, 0.4, 0.6].map((p) => (
          <g key={p}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={sy(p)}
              y2={sy(p)}
              stroke="var(--line)"
              strokeWidth="1"
            />
            <text
              x={PAD.l - 8}
              y={sy(p) + 4.5}
              textAnchor="end"
              fontSize="13"
              fill="var(--ink-4)"
              className="num"
            >
              {Math.round(p * 100)}%
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${uid}-fill)`} />
        <path
          d={path}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* published anchors, so the reader can see what is real */}
        {published.map((a) => (
          <g key={a.t}>
            <circle
              cx={sx(a.t)}
              cy={sy(a.p)}
              r="3"
              fill="var(--surface-2)"
              stroke="var(--ink-3)"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* x ticks */}
        {TICKS.map((tk) => (
          <text
            key={tk.t}
            x={sx(tk.t)}
            y={H - PAD.b + 18}
            textAnchor={tk.t === T_MAX ? "end" : tk.t === 5 ? "start" : "middle"}
            fontSize="13"
            fill="var(--ink-4)"
          >
            {tk.label}
          </text>
        ))}

        {/* hover crosshair */}
        {hoverT !== null && (
          <line
            x1={sx(hoverT)}
            x2={sx(hoverT)}
            y1={PAD.t}
            y2={H - PAD.b}
            stroke="var(--ink-4)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* you are here */}
        <line
          x1={sx(clampedNow)}
          x2={sx(clampedNow)}
          y1={sy(nowP)}
          y2={H - PAD.b}
          stroke={toneVar}
          strokeWidth="1.5"
          strokeOpacity="0.35"
        />
        <circle
          cx={sx(clampedNow)}
          cy={sy(nowP)}
          r="5.5"
          fill={toneVar}
          stroke="var(--surface-2)"
          strokeWidth="2"
        />
      </svg>

      <p
        className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[12.5px]"
        style={{ color: "var(--ink-3)" }}
        aria-live="polite"
      >
        <span>
          {hoverT !== null ? "At " : "Now, "}
          <span className="num" style={{ color: "var(--ink-2)" }}>
            {hoverT !== null ? humanElapsed(readT) : humanElapsed(nowMin)}
          </span>
          {hoverT !== null ? " after it left: " : ": "}
          <span className="num font-semibold" style={{ color: toneVar }}>
            {Math.round(readP * 100)}%
          </span>
        </span>
        <span style={{ color: "var(--ink-4)" }}>
          Hollow dots are published figures. The line between them is our model.
        </span>
      </p>
    </figure>
  );
}
