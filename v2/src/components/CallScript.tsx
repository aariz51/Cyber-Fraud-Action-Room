"use client";

import { useState } from "react";
import { CALL_SCRIPT, ROUTE_LABEL, type FraudRoute } from "@/lib/case";
import { Phone, Copy, Check } from "@phosphor-icons/react";

/**
 * The 1930 script.
 *
 * People go blank on the phone in a crisis, especially when they are ashamed.
 * A script is a small thing that materially changes whether the call produces a
 * freeze request. Hindi is offered alongside English because over 70% of Indian
 * internet users prefer content in an Indian language.
 */
export function CallScript({
  amount,
  route,
  incidentAt,
}: {
  amount: number;
  route: FraudRoute;
  incidentAt: number;
}) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);

  const time = new Date(incidentAt).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  const lines = CALL_SCRIPT[lang].map((l) =>
    l
      .replace("[AMOUNT]", amount.toLocaleString("en-IN"))
      .replace("[ROUTE]", ROUTE_LABEL[route])
      .replace("[TIME]", time)
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="tel:1930"
          className="btn btn-primary px-5 py-3 text-[15px]"
        >
          <Phone size={17} weight="fill" />
          Call 1930 now
        </a>

        <div
          className="ml-auto flex rounded-full p-0.5"
          style={{ background: "var(--surface-sunken)" }}
          role="group"
          aria-label="Script language"
        >
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                background: lang === l ? "var(--surface-2)" : "transparent",
                color: lang === l ? "var(--ink)" : "var(--ink-3)",
              }}
            >
              {l === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-[10px] p-4"
        style={{ background: "var(--surface-3)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium" style={{ color: "var(--ink-2)" }}>
            Read this out. You do not have to explain anything else.
          </p>
          <button type="button" onClick={copy} className="btn btn-ghost !px-2 !py-1 text-xs">
            {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <ol className={`mt-3 space-y-2.5 ${lang === "hi" ? "deva" : ""}`}>
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed">
              <span
                className="num mt-0.5 shrink-0 text-xs"
                style={{ color: "var(--ink-4)" }}
              >
                {i + 1}
              </span>
              <span style={{ color: "var(--ink)" }}>{l}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 text-[13px] leading-snug" style={{ color: "var(--ink-3)" }}>
        1930 is the national cyber-fraud helpline and it runs 24 hours. Calling it
        raises the freeze request faster than any form can.
      </p>
    </div>
  );
}
