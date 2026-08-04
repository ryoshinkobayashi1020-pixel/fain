import { prisma } from "@/lib/prisma";
import { formatYen, monthKey, formatMonthJP } from "@/lib/format";
import { finalPayoutAmount } from "@/lib/payroll";
import PrintButton from "@/components/PrintButton";

export default async function AdminPayrollPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const selectedMonth = month ?? monthKey(new Date());

  const payouts = await prisma.payout.findMany({
    include: {
      adjustments: true,
      shift: { include: { job: true, worker: { include: { workerProfile: true } } } },
    },
  });

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
    <div className="mx-auto max-w-3xl px-4 print:px-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-bold">給与支払い一覧(印刷用)</h1>
        <PrintButton label="この一覧を印刷する" />
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200 print:rounded-none print:p-0 print:ring-0">
        <h2 className="text-xl font-black">{formatMonthJP(selectedMonth)} 給与支払い一覧</h2>
        <p className="mb-4 text-sm text-neutral-600">支払い合計: {formatYen(monthTotal)}</p>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-800 text-left">
              <th className="py-2 pr-3">氏名</th>
              <th className="py-2 pr-3">電話番号</th>
              <th className="py-2 pr-3">LINE名</th>
              <th className="py-2 pr-3">勤務時間</th>
              <th className="py-2 pr-3">支払い額</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-neutral-200">
                <td className="py-2 pr-3 font-medium">{r.name}</td>
                <td className="py-2 pr-3">{r.phone || "-"}</td>
                <td className="py-2 pr-3">{r.lineName || "-"}</td>
                <td className="py-2 pr-3">{r.hours.toFixed(1)}時間</td>
                <td className="py-2 pr-3 font-bold">{formatYen(r.amount)}</td>
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
