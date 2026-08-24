"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, X } from "@phosphor-icons/react";

/**
 * Persistent honesty banner. "Honesty" is a judging criterion for this
 * hackathon, and more importantly a page that looks like a government emergency
 * service must never be mistaken for one. This stays on every route.
 */
export function PrototypeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("gh-banner") === "hidden");
    } catch {
      /* private mode, keep showing */
    }
    setReady(true);
  }, []);

  if (!ready || dismissed) return null;

  return (
    <div
      className="no-print relative z-40 border-b text-[13px]"
      style={{ background: "var(--surface-sunken)", borderColor: "var(--line)" }}
      role="note"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-2 sm:items-center">
        <Info
          size={15}
          weight="fill"
          className="mt-0.5 shrink-0 sm:mt-0"
          style={{ color: "var(--ink-3)" }}
        />
        <p style={{ color: "var(--ink-2)" }} className="leading-snug">
          Independent hackathon prototype. Not a government service and not
          affiliated with I4C, MHA or any bank. Every case, name and number here
          is synthetic.{" "}
          <Link
            href="/how-it-works"
            className="underline underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            What is real and what is mocked
          </Link>
        </p>
        <button
          type="button"
          aria-label="Hide this notice for this session"
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem("gh-banner", "hidden");
            } catch {
              /* ignore */
            }
          }}
          className="btn btn-ghost ml-auto shrink-0 !p-1.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
