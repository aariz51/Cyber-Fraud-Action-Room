"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { RecoveryClock } from "@/components/RecoveryClock";
import { LayerMap } from "@/components/LayerMap";
import { CallScript } from "@/components/CallScript";
import { ComplaintDraft } from "@/components/ComplaintDraft";
import {
  BankNotice,
  EvidenceList,
  FirGuide,
  LiabilityCard,
  StageMachine,
} from "@/components/ActionPanels";
import { DemoControls } from "@/components/DemoControls";
import { useCase } from "@/lib/store";
import { prioritisedActions, ROUTE_LABEL, type ActionId } from "@/lib/case";
import { formatINR } from "@/lib/recovery";
import { CaretDown, CheckCircle, Circle, ArrowRight } from "@phosphor-icons/react";

export default function CasePage() {
  const router = useRouter();
  const { kase, ready, elapsedMin, toggleAction, update } = useCase();
  const [open, setOpen] = useState<ActionId | null>(null);

  // Send anyone without a case back to triage.
  useEffect(() => {
    if (ready && !kase) router.replace("/act");
  }, [ready, kase, router]);

  // Open the highest-value action by default.
  useEffect(() => {
    if (kase && open === null) setOpen("call1930");
  }, [kase, open]);

  if (!ready || !kase) {
    return (
      <>
        <SiteHeader minimal />
        <main className="mx-auto max-w-6xl px-4 py-20">
          <p style={{ color: "var(--ink-3)" }}>Opening your action room</p>
        </main>
      </>
    );
  }

  const actions = prioritisedActions({
    amount: kase.amount,
    route: kase.route,
    elapsedMin,
    consent: kase.consent,
  });

  const remaining = actions.filter((a) => !kase.done.includes(a.id));

  return (
    <>
      <SiteHeader minimal />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        {/* Case header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
              Your action room
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: "var(--ink-2)" }}>
              <span className="num font-medium" style={{ color: "var(--ink)" }}>
                {formatINR(kase.amount)}
              </span>{" "}
              by {ROUTE_LABEL[kase.route].toLowerCase()} · case{" "}
              <span className="num">{kase.id}</span>
            </p>
          </div>
          <Link href="/act" className="btn btn-secondary px-3.5 py-2 text-[13.5px]">
            Start over
          </Link>
        </div>

        {kase.ackNumber && (
          <p
            className="mt-3 flex flex-wrap items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[13.5px]"
            style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
            role="status"
          >
            <CheckCircle size={15} weight="fill" />
            Freeze request filed. Acknowledgement{" "}
            <span className="num font-semibold">{kase.ackNumber}</span>
            <span style={{ color: "var(--ink-4)" }}>(synthetic)</span>
          </p>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          {/* Left rail: the clock and the money */}
          <div className="space-y-5 lg:col-span-5">
            <RecoveryClock elapsedMin={elapsedMin} />
            <LayerMap elapsedMin={elapsedMin} amount={kase.amount} />
            <DemoControls />
          </div>

          {/* Right: what to do */}
          <div className="space-y-5 lg:col-span-7">
            <LiabilityCard kase={kase} />

            <section className="panel overflow-hidden" aria-labelledby="do-heading">
              <div className="p-5 pb-4 sm:px-6">
                <h2 id="do-heading" className="text-[15px] font-semibold tracking-tight">
                  Do these, in this order
                </h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  Ordered by how much each one recovers, not by how a form is laid
                  out.{" "}
                  {remaining.length > 0 && (
                    <>
                      <span className="num font-medium" style={{ color: "var(--ink)" }}>
                        {remaining.length}
                      </span>{" "}
                      left.
                    </>
                  )}
                </p>
              </div>

              <ol>
                {actions.map((a, i) => {
                  const isDone = kase.done.includes(a.id);
                  const isOpen = open === a.id;
                  return (
                    <li
                      key={a.id}
                      style={{ borderTop: "1px solid var(--line)" }}
                      className={isDone ? "opacity-70" : ""}
                    >
                      <h3>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : a.id)}
                          aria-expanded={isOpen}
                          className="flex w-full items-start gap-3 px-5 py-4 text-left sm:px-6"
                          style={{ cursor: "pointer" }}
                        >
                          <span
                            className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                            style={{
                              background: isDone ? "var(--ok-soft)" : "var(--surface-3)",
                              color: isDone ? "var(--ok)" : "var(--ink-2)",
                            }}
                          >
                            {isDone ? <CheckCircle size={15} weight="fill" /> : i + 1}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className="block text-[15px] font-medium leading-snug"
                              style={{
                                color: "var(--ink)",
                                textDecoration: isDone ? "line-through" : undefined,
                              }}
                            >
                              {a.title}
                            </span>
                            <span
                              className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px]"
                              style={{ color: "var(--ink-3)" }}
                            >
                              <span className="num">about {a.minutesToDo} min</span>
                              {a.points >= 1 && (
                                <span
                                  className="chip !py-0 !text-[10.5px]"
                                  style={{
                                    background: "var(--accent-soft)",
                                    color: "var(--accent)",
                                  }}
                                >
                                  worth {a.points.toFixed(a.points < 10 ? 1 : 0)} points
                                </span>
                              )}
                            </span>
                          </span>

                          <CaretDown
                            size={16}
                            className="mt-1 shrink-0"
                            style={{
                              color: "var(--ink-4)",
                              transform: isOpen ? "rotate(180deg)" : "none",
                              transition: "transform 180ms var(--ease-out-strong)",
                            }}
                          />
                        </button>
                      </h3>

                      {isOpen && (
                        <div className="rise px-5 pb-5 sm:px-6">
                          <p
                            className="mb-4 text-[13.5px] leading-relaxed"
                            style={{ color: "var(--ink-2)" }}
                          >
                            {a.why}
                          </p>

                          {a.id === "call1930" && (
                            <CallScript
                              amount={kase.amount}
                              route={kase.route}
                              incidentAt={kase.incidentAt}
                            />
                          )}
                          {a.id === "freeze" && (
                            <ComplaintDraft
                              kase={kase}
                              elapsedMin={elapsedMin}
                              onNarrative={(v) => update({ narrative: v })}
                            />
                          )}
                          {a.id === "bank" && <BankNotice kase={kase} />}
                          {a.id === "evidence" && <EvidenceList />}
                          {a.id === "fir" && <FirGuide amount={kase.amount} />}

                          <button
                            type="button"
                            onClick={() => {
                              toggleAction(a.id);
                              const nextUndone = actions.find(
                                (x) => x.id !== a.id && !kase.done.includes(x.id)
                              );
                              setOpen(isDone ? a.id : (nextUndone?.id ?? null));
                            }}
                            className="btn btn-secondary mt-5 px-4 py-2.5 text-[14px]"
                          >
                            {isDone ? (
                              <>
                                <Circle size={15} />
                                Mark as not done
                              </>
                            ) : (
                              <>
                                <CheckCircle size={15} weight="fill" />
                                I have done this
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              {remaining.length === 0 && (
                <div
                  className="flex flex-wrap items-center gap-2 px-5 py-4 text-[14px] sm:px-6"
                  style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
                  role="status"
                >
                  <CheckCircle size={17} weight="fill" />
                  Everything that helps in the first hours is done. Now it moves to
                  the stages below.
                </div>
              )}
            </section>

            <StageMachine elapsedMin={elapsedMin} done={kase.done} />

            <div
              className="panel flex flex-wrap items-center justify-between gap-3 p-5"
              style={{ background: "var(--surface-3)" }}
            >
              <p className="text-[14px]" style={{ color: "var(--ink-2)" }}>
                Someone told you your account is frozen because of a case like this?
              </p>
              <Link href="/frozen" className="btn btn-secondary px-4 py-2.5 text-[14px]">
                Check if that freeze is lawful
                <ArrowRight size={15} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
