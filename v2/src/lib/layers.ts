/**
 * THE LAYER MAP
 * -------------
 * Stolen money does not sit still. It is split and forwarded through a chain of
 * mule accounts, conventionally called Layer 1, Layer 2 and so on, until it is
 * cashed out. I4C shares Layer 1 mule account lists with banks precisely because
 * Layer 1 is the only layer that is reliably catchable.
 *
 * This module models that movement so a victim can SEE why the clock matters.
 *
 * HONESTY: transit times here are illustrative. Real mule-network timing varies
 * enormously and is not published. The shape (fast fan-out, cash-out within a
 * day) matches how these networks are publicly described. Every screen that uses
 * this says so.
 */

export interface LayerState {
  layer: number;
  /** share of the stolen amount currently sitting in this layer, 0..1 */
  share: number;
  /** how reachable a freeze request is at this layer, 0..1 */
  reachability: number;
  label: string;
  detail: string;
}

export interface LayerSnapshot {
  layers: LayerState[];
  /** share already withdrawn as cash or converted, 0..1 */
  cashedOut: number;
  /** share still theoretically freezable, weighted by reachability */
  freezableShare: number;
  /** how many mule accounts the money is spread across right now */
  accountsInvolved: number;
}

/** Median minutes at which each layer starts receiving money. */
const LAYER_ONSET = [0, 12, 75, 300];
/** Minutes over which a layer drains into the next one. */
const LAYER_DRAIN = [45, 150, 420, 900];

const LAYER_META = [
  {
    label: "Layer 1",
    detail: "The account you paid. Banks receive I4C mule lists for this layer, so it is the most catchable.",
    reachability: 0.95,
  },
  {
    label: "Layer 2",
    detail: "Split across several accounts within minutes. Still traceable, freezes get slower.",
    reachability: 0.62,
  },
  {
    label: "Layer 3",
    detail: "Fanned out widely, often across states and banks. Each freeze needs a separate request.",
    reachability: 0.3,
  },
  {
    label: "Layer 4",
    detail: "Wallets, cash withdrawals and crypto off-ramps. Rarely recoverable.",
    reachability: 0.08,
  },
];

/** Smooth 0..1 ramp used to drain one layer into the next. */
function ramp(t: number, start: number, span: number): number {
  if (t <= start) return 0;
  if (t >= start + span) return 1;
  const k = (t - start) / span;
  // ease-in-out so the fan-out reads as a wave rather than a step
  return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
}

export function layerSnapshot(minutes: number): LayerSnapshot {
  const t = Math.max(0, minutes);

  // Cumulative share that has reached at least layer i.
  const reached = LAYER_ONSET.map((onset, i) =>
    i === 0 ? 1 : ramp(t, onset, LAYER_DRAIN[i - 1])
  );
  // Share cashed out entirely.
  const cashedOut = ramp(t, LAYER_ONSET[3] + 120, LAYER_DRAIN[3]);

  const layers: LayerState[] = LAYER_META.map((meta, i) => {
    const next = i < reached.length - 1 ? reached[i + 1] : cashedOut;
    const share = Math.max(0, reached[i] - next);
    return {
      layer: i + 1,
      share,
      reachability: meta.reachability,
      label: meta.label,
      detail: meta.detail,
    };
  });

  // Remove the portion that has been cashed out from the last layer's pool.
  const live = layers.reduce((s, l) => s + l.share, 0);
  const scale = live > 0 ? Math.max(0, 1 - cashedOut) / live : 0;
  const scaled = layers.map((l) => ({ ...l, share: l.share * scale }));

  const freezableShare = scaled.reduce((s, l) => s + l.share * l.reachability, 0);

  // Accounts grow roughly geometrically as the money fans out.
  const accountsInvolved = Math.max(
    1,
    Math.round(
      scaled.reduce((s, l, i) => s + (l.share > 0.01 ? Math.pow(3.2, i) : 0), 0)
    )
  );

  return { layers: scaled, cashedOut, freezableShare, accountsInvolved };
}

/** Plain-language sentence describing where the money is right now. */
export function describeLayers(minutes: number): string {
  const snap = layerSnapshot(minutes);
  const dominant = snap.layers.reduce((a, b) => (b.share > a.share ? b : a));
  if (snap.cashedOut > 0.55) {
    return "Most of this money has already been withdrawn as cash or moved off into wallets.";
  }
  if (dominant.layer === 1) {
    return "Most of the money is still sitting in the account you paid. This is the best moment to freeze it.";
  }
  if (dominant.layer === 2) {
    return `It has been split across roughly ${snap.accountsInvolved} accounts. A freeze still reaches most of it.`;
  }
  if (dominant.layer === 3) {
    return `It is spread across roughly ${snap.accountsInvolved} accounts in different banks. Each one needs its own freeze request.`;
  }
  return "It has reached the cash-out layer. Freezing rarely works this far down the chain.";
}
