import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateJP, formatYen } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [openJobs, pendingApplications, todayShifts, pendingPayoutAgg, workerCount] =
    await Promise.all([
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.application.count({ where: { status: "APPLIED" } }),
      prisma.shift.count({
        where: {
          job: { workDate: { gte: new Date(new Date().toDateString()) } },
          status: { in: ["SCHEDULED", "CHECKED_IN"] },
        },
      }),
      prisma.payout.aggregate({ _sum: { amount: true }, where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "WORKER" } }),
    ]);

  const recentApplications = await prisma.application.findMany({
    where: { status: "APPLIED" },
    include: { worker: true, job: true },
    orderBy: { appliedAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "募集中の案件", value: `${openJobs}件` },
    { label: "未確定の応募", value: `${pendingApplications}件` },
    { label: "本日以降の確定シフト", value: `${todayShifts}件` },
    { label: "登録スタッフ数", value: `${workerCount}名` },
    { label: "未払いの給与", value: formatYen(pendingPayoutAgg._sum.amount ?? 0) },
  ];

  return (
    <div>
      <h1 className="mb-4 text-xl font-black">ダッシュボード</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
            <p className="mb-1 text-[11px] text-neutral-500">{s.label}</p>
            <p className="text-lg font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">承認待ちの応募</h2>
          <Link href="/admin/jobs" className="text-xs font-semibold text-accent">
            案件一覧へ
          </Link>
        </div>

        {recentApplications.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-400">
            承認待ちの応募はありません
          </p>
        )}

        <div className="divide-y divide-neutral-100">
          {recentApplications.map((app) => (
            <Link
              key={app.id}
              href={`/admin/jobs/${app.jobId}`}
              className="flex items-center justify-between py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{app.worker.name}</p>
                <p className="text-xs text-neutral-500">{app.job.title}</p>
              </div>
              <span className="text-xs text-neutral-400">
                {formatDateJP(app.job.workDate)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
