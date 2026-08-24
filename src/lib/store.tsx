"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ActionId, Consent, FraudRoute } from "./case";

/**
 * Case state. Deliberately client-side and ephemeral.
 *
 * A real build of this would need a server, because a freeze request has to
 * reach a bank. For a prototype handling something as sensitive as a fraud
 * report, keeping everything in the browser is the honest choice: nothing a
 * reviewer types is transmitted or stored anywhere.
 *
 * Implemented as two external stores read through useSyncExternalStore. The
 * clock genuinely is external mutable state, and so is localStorage, so this is
 * the right primitive. It also keeps Date.now out of render, which would
 * otherwise make the component impure.
 */

export interface CaseState {
  id: string;
  amount: number;
  route: FraudRoute;
  consent: Consent;
  /** epoch ms when the money left */
  incidentAt: number;
  /** epoch ms when the case was opened in this app */
  openedAt: number;
  narrative: string;
  state: string;
  done: ActionId[];
  ackNumber: string | null;
  demoOffsetMin: number;
}

const KEY = "gh-case-v1";

/* ------------------------------------------------------------------ */
/* Case store                                                          */
/* ------------------------------------------------------------------ */

let caseSnapshot: CaseState | null = null;
let hydrated = false;
const caseListeners = new Set<() => void>();

function readStorage(): CaseState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CaseState) : null;
  } catch {
    return null;
  }
}

function writeStorage(next: CaseState | null) {
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode, the app still works in memory */
  }
}

function emitCase() {
  for (const l of caseListeners) l();
}

function subscribeCase(cb: () => void) {
  // Hydrate on the first subscription, which happens after mount.
  if (!hydrated) {
    hydrated = true;
    caseSnapshot = readStorage();
  }
  caseListeners.add(cb);
  return () => {
    caseListeners.delete(cb);
  };
}

function getCaseSnapshot(): CaseState | null {
  return caseSnapshot;
}

/** Server and first client render agree on null, so hydration never mismatches. */
function getCaseServerSnapshot(): CaseState | null {
  return null;
}

function setCase(next: CaseState | null) {
  caseSnapshot = next;
  writeStorage(next);
  emitCase();
}

/* ------------------------------------------------------------------ */
/* Clock store                                                         */
/* ------------------------------------------------------------------ */

let nowSnapshot = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const clockListeners = new Set<() => void>();

function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (!timer) {
    nowSnapshot = Date.now();
    timer = setInterval(() => {
      nowSnapshot = Date.now();
      for (const l of clockListeners) l();
    }, 1000);
  }
  return () => {
    clockListeners.delete(cb);
    if (clockListeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getNow(): number {
  // Populated by subscribeClock before the first post-mount read.
  return nowSnapshot;
}

function getNowServer(): number {
  return 0;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

function makeId(): string {
  const n = Math.floor(Math.random() * 9000 + 1000);
  return `GH-${new Date().getFullYear()}-${n}`;
}

export function useCase() {
  const kase = useSyncExternalStore(
    subscribeCase,
    getCaseSnapshot,
    getCaseServerSnapshot
  );
  const now = useSyncExternalStore(subscribeClock, getNow, getNowServer);

  // `now` is 0 only until the clock store starts, which is the same tick the
  // case store hydrates. Treat that as "not ready" rather than rendering a case
  // with a nonsensical elapsed time.
  const ready = now !== 0;

  const create = useCallback(
    (
      input: Omit<CaseState, "id" | "openedAt" | "done" | "ackNumber" | "demoOffsetMin">
    ) => {
      const id = makeId();
      setCase({
        ...input,
        id,
        openedAt: Date.now(),
        done: [],
        ackNumber: null,
        demoOffsetMin: 0,
      });
      return id;
    },
    []
  );

  const update = useCallback((patch: Partial<CaseState>) => {
    if (!caseSnapshot) return;
    setCase({ ...caseSnapshot, ...patch });
  }, []);

  const toggleAction = useCallback((id: ActionId) => {
    const c = caseSnapshot;
    if (!c) return;
    const done = c.done.includes(id)
      ? c.done.filter((x) => x !== id)
      : [...c.done, id];
    // Filing the freeze request is what produces an acknowledgement number.
    const ackNumber = done.includes("freeze")
      ? (c.ackNumber ?? `${Math.floor(Math.random() * 9e13 + 1e13)}`)
      : null;
    setCase({ ...c, done, ackNumber });
  }, []);

  const clear = useCallback(() => setCase(null), []);

  const elapsedMin = useMemo(() => {
    if (!kase || !ready) return 0;
    return Math.max(0, (now - kase.incidentAt) / 60000 + kase.demoOffsetMin);
  }, [kase, now, ready]);

  return { kase, ready, create, update, toggleAction, clear, elapsedMin };
}

/**
 * Kept so the root layout can wrap the tree without every consumer needing a
 * provider. The stores above are module-level, so this renders children as is.
 */
export function CaseProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
