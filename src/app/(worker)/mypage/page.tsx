import Link from "next/link";
import { ChevronRight, ClipboardList, CalendarCheck, Wallet, UserPen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatYen } from "@/lib/format";

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [appliedCount, confirmedCount, totalEarned] = await Promise.all([
    prisma.application.count({ where: { workerId: user.id, status: "APPLIED" } }),
    prisma.application.count({ where: { workerId: user.id, status: "CONFIRMED" } }),
    prisma.payout.aggregate({
      _sum: { amount: true },
      where: { shift: { workerId: user.id }, status: "PAID" },
    }),
  ]);

  const links = [
    { href: "/mypage/applications", label: "応募履歴", icon: ClipboardList },
    { href: "/mypage/shifts", label: "シフト・勤怠", icon: CalendarCheck },
    { href: "/mypage/earnings", label: "収入", icon: Wallet },
    { href: "/mypage/profile", label: "プロフィール編集", icon: UserPen },
  ];

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-4 text-xl font-black">マイページ</h1>

      <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <p className="text-base font-bold">{user.name} さん</p>
        <p className="text-xs text-neutral-500">{user.email}</p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white p-3 text-center ring-1 ring-neutral-200">
          <p className="text-lg font-black text-accent">{appliedCount}</p>
          <p className="text-[11px] text-neutral-500">応募中</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center ring-1 ring-neutral-200">
          <p className="text-lg font-black text-accent">{confirmedCount}</p>
          <p className="text-[11px] text-neutral-500">確定シフト</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center ring-1 ring-neutral-200">
          <p className="text-lg font-black text-accent">
            {formatYen(totalEarned._sum.amount ?? 0)}
          </p>
          <p className="text-[11px] text-neutral-500">受取済み</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
        {links.map(({ href, label, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i !== links.length - 1 ? "border-b border-neutral-100" : ""
            }`}
          >
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <Icon size={18} className="text-neutral-400" />
              {label}
            </span>
            <ChevronRight size={16} className="text-neutral-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
