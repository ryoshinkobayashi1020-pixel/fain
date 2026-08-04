"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CalendarCheck, Wallet, User } from "lucide-react";

const items = [
  { href: "/jobs", label: "案件をさがす", icon: Briefcase },
  { href: "/mypage/shifts", label: "シフト", icon: CalendarCheck },
  { href: "/mypage/earnings", label: "収入", icon: Wallet },
  { href: "/mypage", label: "マイページ", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-lg justify-between px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/jobs"
              ? pathname === "/jobs" || pathname.startsWith("/jobs/")
              : pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? "text-accent" : "text-neutral-400"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
