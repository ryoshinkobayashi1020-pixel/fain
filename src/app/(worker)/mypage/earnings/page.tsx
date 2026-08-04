import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDateJP, formatYen } from "@/lib/format";
import { finalPayoutAmount } from "@/lib/payroll";

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const payouts = await prisma.payout.findMany({
    where: { shift: { workerId: user.id } },
    include: { shift: { include: { job: true } }, adjustments: true },
    orderBy: { shift: { job: { workDate: "desc" } } },
  });

  const paidTotal = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + finalPayoutAmount(p), 0);
  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + finalPayoutAmount(p), 0);

  return (
    <div className="px-4 pt-4">
      <Link href="/mypage" className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> マイページ
      </Link>
      <h1 className="mb-4 text-xl font-black">収入</h1>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
          <p className="mb-1 text-[11px] text-neutral-500">受取済み合計</p>
          <p className="text-xl font-black text-accent">{formatYen(paidTotal)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
          <p className="mb-1 text-[11px] text-neutral-500">支払い待ち</p>
          <p className="text-xl font-black text-neutral-700">{formatYen(pendingTotal)}</p>
        </div>
      </div>

      {payouts.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-neutral-400 ring-1 ring-neutral-200">
          勤務実績はまだありません
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {payouts.map((payout) => (
          <div
            key={payout.id}
            className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-neutral-200"
          >
            <div>
              <p className="text-sm font-bold">{payout.shift.job.title}</p>
              <p className="text-xs text-neutral-500">
                {formatDateJP(payout.shift.job.workDate)} ・ {payout.hoursWorked.toFixed(1)}時間
              </p>
              {payout.adjustments.map((adj) => (
                <p key={adj.id} className="text-[11px] text-neutral-400">
                  {adj.label} {adj.amount >= 0 ? "+" : ""}
                  {formatYen(adj.amount)}
                </p>
              ))}
            </div>
            <div className="text-right">
              <p className="text-base font-black">{formatYen(finalPayoutAmount(payout))}</p>
              <span
                className={`text-[11px] font-bold ${
                  payout.status === "PAID" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {payout.status === "PAID" ? "支払済み" : "支払い待ち"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
