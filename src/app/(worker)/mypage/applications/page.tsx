import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDateJP } from "@/lib/format";

const statusLabel: Record<string, { text: string; className: string }> = {
  APPLIED: { text: "応募中", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { text: "確定", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { text: "不採用", className: "bg-neutral-200 text-neutral-500" },
  CANCELED: { text: "キャンセル済", className: "bg-neutral-200 text-neutral-500" },
  COMPLETED: { text: "完了", className: "bg-blue-100 text-blue-700" },
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const applications = await prisma.application.findMany({
    where: { workerId: user.id },
    include: { job: true },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div className="px-4 pt-4">
      <Link href="/mypage" className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> マイページ
      </Link>
      <h1 className="mb-4 text-xl font-black">応募履歴</h1>

      {applications.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-neutral-400 ring-1 ring-neutral-200">
          応募した案件はありません
        </p>
      )}

      <div className="flex flex-col gap-3">
        {applications.map((app) => {
          const badge = statusLabel[app.status];
          return (
            <Link
              key={app.id}
              href={`/jobs/${app.jobId}`}
              className="block rounded-2xl bg-white p-4 ring-1 ring-neutral-200"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-neutral-400">
                  {app.job.clientCompany}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
                  {badge.text}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-bold">{app.job.title}</h3>
              <p className="text-xs text-neutral-500">
                {formatDateJP(app.job.workDate)} {app.job.startTime}〜{app.job.endTime}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
