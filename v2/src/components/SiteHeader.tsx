import Link from "next/link";
import { ClockCountdown, PhoneCall } from "@phosphor-icons/react/dist/ssr";

/** Nav stays on one line at desktop and under 80px tall, per the layout rules. */
export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <>
      {!minimal && (
        <div className="emergency-bar no-print">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-3 px-4 text-[0.7rem]">
            <span className="text-[#b9b6af]">Money just left your account?</span>
            <a href="tel:1930" className="flex items-center gap-1.5 font-bold text-[#f0b04c]">
              <PhoneCall size={13} weight="fill" />
              Call 1930 now
            </a>
          </div>
        </div>
      )}
      <header
        className="no-print sticky top-0 z-30 backdrop-blur"
        style={{
          background: "color-mix(in srgb, var(--surface) 86%, transparent)",
          borderBottom: "1px solid var(--line)",
        }}
      >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="relative grid h-9 w-14 place-items-start" aria-hidden="true">
            <ClockCountdown size={28} weight="light" color="var(--accent)" />
            <span className="absolute left-7 top-[17px] h-px w-7 border-t border-dashed border-[var(--accent)]" />
          </span>
          <span>
            <span className="display block text-[1.18rem] leading-none">Golden Hour</span>
            <span className="mt-1 hidden text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--ink-3)] sm:block">
              Cyber Fraud Action Room
            </span>
          </span>
        </Link>

        {!minimal && (
          <nav className="ml-auto flex items-center gap-1 text-[13px]">
            <Link href="/proposal" className="btn btn-ghost hidden !px-3 !py-2 lg:inline-flex">
              The fix
            </Link>
            <Link href="/methodology" className="btn btn-ghost hidden !px-3 !py-2 md:inline-flex">
              Methodology
            </Link>
            <Link href="/action-room/frozen" className="btn btn-ghost hidden !px-3 !py-2 sm:inline-flex">
              Account frozen
            </Link>
            <Link href="/action-room" className="btn btn-primary ml-1 !px-4 !py-2.5 text-[13px]">
              Enter Action Room
            </Link>
          </nav>
        )}
      </div>
      </header>
    </>
  );
}
