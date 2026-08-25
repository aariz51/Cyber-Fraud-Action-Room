"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOut,
  Bank,
  ClipboardText,
  ClockCountdown,
  FileText,
  FolderOpen,
  House,
  ListChecks,
  Path,
  PhoneCall,
  Snowflake,
} from "@phosphor-icons/react";

const NAV = [
  { href: "/action-room", label: "Overview", icon: House, exact: true },
  { href: "/action-room/intake", label: "Start triage", icon: ClockCountdown },
  { href: "/action-room/what-to-do", label: "What to do now", icon: ListChecks },
  { href: "/action-room/money-trail", label: "Money trail", icon: Path },
  { href: "/action-room/evidence", label: "Evidence locker", icon: FolderOpen },
  { href: "/action-room/complaint", label: "Complaint draft", icon: FileText },
  { href: "/action-room/recovery", label: "Recovery tracker", icon: ClipboardText },
  { href: "/action-room/frozen", label: "Frozen account", icon: Snowflake },
] as const;

const DOCK = [NAV[0], NAV[1], NAV[2], NAV[5], NAV[7]];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Golden Hour home">
      <span className="relative grid h-9 w-14 place-items-start" aria-hidden="true">
        <ClockCountdown size={28} weight="light" color="var(--accent)" />
        <span className="absolute left-7 top-[17px] h-px w-7 border-t border-dashed border-[var(--accent)]" />
      </span>
      <span>
        <span className="display block text-[1.18rem] leading-none">Golden Hour</span>
        <span className="mt-1 block text-[0.59rem] font-bold uppercase tracking-[0.18em] text-[var(--ink-4)]">
          Action Room
        </span>
      </span>
    </Link>
  );
}

export function ActionRoomNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <div className="app-mobile-top">
        <Brand />
        <a href="tel:1930" className="btn btn-primary px-3 py-2 text-xs">
          <PhoneCall size={15} weight="fill" />
          1930
        </a>
      </div>

      <div className="app-frame">
        <aside className="app-sidebar no-print px-4 py-5">
          <Brand />

          <div className="mt-7 rounded-xl border border-[var(--line)] bg-[var(--surface-3)] p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
              <span className="status-dot" />
              Emergency utility
            </div>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-[var(--ink-3)]">
              If money just moved, call the national helpline before completing a form.
            </p>
            <a href="tel:1930" className="btn btn-primary mt-3 w-full px-3 py-2.5 text-xs">
              <PhoneCall size={15} weight="fill" />
              Call 1930
            </a>
          </div>

          <nav className="mt-5 space-y-1" aria-label="Action Room navigation">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
              return (
                <Link key={item.href} href={item.href} className="app-nav-link" data-active={active}>
                  <Icon size={17} weight={active ? "fill" : "regular"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[var(--line)] pt-4">
            <Link href="/methodology" className="app-nav-link">
              <Bank size={17} />
              Sources &amp; methodology
            </Link>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="app-nav-link"
            >
              <ArrowSquareOut size={17} />
              cybercrime.gov.in
            </a>
            <p className="px-3 pt-3 text-[0.62rem] leading-relaxed text-[var(--ink-4)]">
              Hackathon prototype. Case data stays in this browser unless you generate a draft.
            </p>
          </div>
        </aside>

        <div className="app-content">{children}</div>
      </div>

      <nav className="app-mobile-dock no-print" aria-label="Mobile Action Room navigation">
        {DOCK.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
          return (
            <Link key={item.href} href={item.href} className="app-dock-link" data-active={active}>
              <Icon size={19} weight={active ? "fill" : "regular"} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
