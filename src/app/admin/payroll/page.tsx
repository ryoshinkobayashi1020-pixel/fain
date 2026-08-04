import Link from "next/link";
import { Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatYen, monthKey, formatMonthJP } from "@/lib/format";
import { finalPayoutAmount } from "@/lib/payroll";

export default async function AdminPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const payouts = await prisma.payout.findMany({
    include: {
      adjustments: true,
      shift: { include: { job: true, worker: { include: { workerProfile: true } } } },
    },
    orderBy: { shift: { job: { workDate: "desc" } } },
  });

  const months = Array.from(new Set(payouts.map((p) => monthKey(p.shift.job.workDate)))).sort(
    (a, b) => (a < b ? 1 : -1)
  );
  const selectedMonth = month && months.includes(month) ? month : months[0] ?? monthKey(new Date());

  const monthPayouts = payouts.filter((p) => monthKey(p.shift.job.workDate) === selectedMonth);

  const byWorker = new Map<
    string,
    { name: string; phone: string | null; lineName: string | null; hours: number; amount: number }
  >();
  for (const p of monthPayouts) {
    const w = p.shift.worker;
    const entry = byWorker.get(w.id) ?? {
      name: w.name,
      phone: w.phone,
      lineName: w.workerProfile?.lineName ?? null,
      hours: 0,
      amount: 0,
    };
    entry.hours += p.hoursWorked;
    entry.amount += finalPayoutAmount(p);
    byWorker.set(w.id, entry);
  }
  const rows = Array.from(byWorker.values()).sort((a, b) => b.amount - a.amount);
  const monthTotal = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black">給与管理</h1>
        <Link
          href={`/admin/payroll/print?month=${selectedMonth}`}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
        >
          <Printer size={15} />
          この月を印刷
        </Link>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {months.length === 0 && (
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-400 ring-1 ring-neutral-200">
            {formatMonthJP(selectedMonth)}
          </span>
        )}
        {months.map((m) => (
          <Link
            key={m}
            href={`/admin/payroll?month=${m}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              m === selectedMonth ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
            }`}
          >
            {formatMonthJP(m)}
          </Link>
        ))}
      </div>

      <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-neutral-200 sm:w-72">
        <p className="mb-1 text-[11px] text-neutral-500">{formatMonthJP(selectedMonth)} 支払い合計</p>
        <p className="text-xl font-black text-accent">{formatYen(monthTotal)}</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">スタッフ</th>
              <th className="px-4 py-2.5 font-medium">連絡先</th>
              <th className="px-4 py-2.5 font-medium">勤務時間</th>
              <th className="px-4 py-2.5 font-medium">支払い額</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-semibold">{r.name}</td>
                <td className="px-4 py-3 text-xs text-neutral-600">
                  {r.phone || "-"}
                  {r.lineName && <div className="text-neutral-400">LINE: {r.lineName}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">{r.hours.toFixed(1)}時間</td>
                <td className="px-4 py-3 text-sm font-bold text-accent">{formatYen(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">この月の給与データはありません</p>
        )}
      </div>
    </div>
  );
}
