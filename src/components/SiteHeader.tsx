import Link from "next/link";

/** Nav stays on one line at desktop and under 80px tall, per the layout rules. */
export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header
      className="no-print sticky top-0 z-30 backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--surface) 88%, transparent)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Mark />
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-semibold tracking-tight">Golden Hour</span>
            <span
              className="deva hidden text-[13px] sm:inline"
              style={{ color: "var(--ink-3)" }}
            >
              पहला घंटा
            </span>
          </span>
        </Link>

        {!minimal && (
          <nav className="ml-auto flex items-center gap-1 text-[13.5px]">
            <Link href="/frozen" className="btn btn-ghost !px-2.5 !py-2 sm:!px-3">
              Account frozen
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost !px-2.5 !py-2 sm:!px-3">
              How it works
            </Link>
            <Link href="/act" className="btn btn-primary ml-1 !px-3.5 !py-2 text-[13.5px]">
              Start
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

/** Simple clock mark. A circle with a hand at five past, drawn from tokens. */
function Mark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
      />
      <path
        d="M12 6.75V12l3.4 2"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
