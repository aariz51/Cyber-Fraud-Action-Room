"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ActionId, Consent, FraudRoute } from "./case";

/**
 * Case state. Deliberately client-side and ephemeral.
 *
 * A real build of this would need a server, because a freeze request has to
 * reach a bank. For a prototype handling something as sensitive as a fraud
 * report, keeping everything in the browser is the honest choice: nothing a
 * reviewer types is transmitted or stored anywhere.
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

interface Ctx {
  kase: CaseState | null;
  ready: boolean;
  create: (input: Omit<CaseState, "id" | "openedAt" | "done" | "ackNumber" | "demoOffsetMin">) => string;
  update: (patch: Partial<CaseState>) => void;
  toggleAction: (id: ActionId) => void;
  clear: () => void;
  /** minutes elapsed since the money left, including any demo time-travel */
  elapsedMin: number;
}

const CaseCtx = createContext<Ctx | null>(null);
const KEY = "gh-case-v1";

function makeId(): string {
  // Short, readable, obviously synthetic.
  const n = Math.floor(Math.random() * 9000 + 1000);
  return `GH-${new Date().getFullYear()}-${n}`;
}

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [kase, setKase] = useState<CaseState | null>(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  // Hydrate once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setKase(JSON.parse(raw) as CaseState);
    } catch {
      /* corrupt or unavailable, start fresh */
    }
    setReady(true);
  }, []);

  // Persist.
  useEffect(() => {
    if (!ready) return;
    try {
      if (kase) localStorage.setItem(KEY, JSON.stringify(kase));
      else localStorage.removeItem(KEY);
    } catch {
      /* private mode, the app still works in memory */
    }
  }, [kase, ready]);

  // Drive the clock. One interval for the whole app.
  useEffect(() => {
    if (!kase) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [kase]);

  const create: Ctx["create"] = useCallback((input) => {
    const id = makeId();
    const next: CaseState = {
      ...input,
      id,
      openedAt: Date.now(),
      done: [],
      ackNumber: null,
      demoOffsetMin: 0,
    };
    setKase(next);
    return id;
  }, []);

  const update: Ctx["update"] = useCallback((patch) => {
    setKase((c) => (c ? { ...c, ...patch } : c));
  }, []);

  const toggleAction: Ctx["toggleAction"] = useCallback((id) => {
    setKase((c) => {
      if (!c) return c;
      const done = c.done.includes(id)
        ? c.done.filter((x) => x !== id)
        : [...c.done, id];
      // Filing the freeze request is what produces an acknowledgement number.
      const ackNumber =
        done.includes("freeze") && !c.ackNumber
          ? `${Math.floor(Math.random() * 9e13 + 1e13)}`
          : done.includes("freeze")
            ? c.ackNumber
            : null;
      return { ...c, done, ackNumber };
    });
  }, []);

  const clear = useCallback(() => setKase(null), []);

  const elapsedMin = useMemo(() => {
    if (!kase) return 0;
    void tick; // recompute every second
    const raw = (Date.now() - kase.incidentAt) / 60000;
    return Math.max(0, raw + kase.demoOffsetMin);
  }, [kase, tick]);

  const value = useMemo(
    () => ({ kase, ready, create, update, toggleAction, clear, elapsedMin }),
    [kase, ready, create, update, toggleAction, clear, elapsedMin]
  );

  return <CaseCtx.Provider value={value}>{children}</CaseCtx.Provider>;
}

export function useCase(): Ctx {
  const c = useContext(CaseCtx);
  if (!c) throw new Error("useCase must be used inside CaseProvider");
  return c;
}
