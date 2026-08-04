import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateJP, formatDateTimeJP, formatYen } from "@/lib/format";
import { finalPayoutAmount } from "@/lib/payroll";
import {
  closeJob,
  reopenJob,
  confirmApplication,
  rejectApplication,
  addPayoutAdjustment,
  deletePayoutAdjustment,
} from "../actions";

const ADJUSTMENT_PRESETS = ["残業代", "駐車場代", "遅刻減給", "欠勤減給", "その他"];

const appStatusLabel: Record<string, { text: string; className: string }> = {
  APPLIED: { text: "応募中", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { text: "確定", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { text: "不採用", className: "bg-neutral-200 text-neutral-500" },
  CANCELED: { text: "キャンセル", className: "bg-neutral-200 text-neutral-500" },
  COMPLETED: { text: "完了", className: "bg-blue-100 text-blue-700" },
};

const shiftStatusLabel: Record<string, { text: string; className: string }> = {
  SCHEDULED: { text: "出勤前", className: "bg-neutral-100 text-neutral-500" },
  CHECKED_IN: { text: "勤務中", className: "bg-amber-100 text-amber-700" },
  CHECKED_OUT: { text: "退勤済み", className: "bg-emerald-100 text-emerald-700" },
  NO_SHOW: { text: "無断欠勤", className: "bg-red-100 text-red-700" },
};

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: { include: { worker: true }, orderBy: { appliedAt: "asc" } },
      shifts: { include: { worker: true, payout: { include: { adjustments: true } } } },
    },
  });
  if (!job) notFound();

  const confirmedCount = job.applications.filter((a) => a.status === "CONFIRMED").length;
  const closeWithId = closeJob.bind(null, job.id);
  const reopenWithId = reopenJob.bind(null, job.id);

  return (
    <div>
      <Link href="/admin/jobs" className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> 案件一覧
      </Link>

      <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl bg-white p-5 ring-1 ring-neutral-200 sm:flex-row sm:items-start">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <p className="text-xs font-semibold text-neutral-400">{job.clientCompany}</p>
            {job.category && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-accent">
                {job.category}
              </span>
            )}
          </div>
          <h1 className="mb-1 text-lg font-black">{job.title}</h1>
          <p className="text-sm text-neutral-500">
            {formatDateJP(job.workDate)} {job.startTime}〜{job.endTime} ・ {job.location} ・{" "}
            {formatYen(job.hourlyWage)}/時 ・ 確定 {confirmedCount}/{job.capacity}名
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/admin/jobs/${job.id}/print`}
            className="whitespace-nowrap rounded-full border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-600"
          >
            応募者一覧を印刷
          </Link>
          <Link
            href={`/admin/jobs/${job.id}/edit`}
            className="whitespace-nowrap rounded-full border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-600"
          >
            編集する
          </Link>
          <form action={job.status === "OPEN" ? closeWithId : reopenWithId}>
            <button
              type="submit"
              className="whitespace-nowrap rounded-full border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-600"
            >
              {job.status === "OPEN" ? "募集を締め切る" : "募集を再開する"}
            </button>
          </form>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
        <h2 className="mb-3 text-sm font-bold">応募者一覧</h2>
        {job.applications.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-400">まだ応募はありません</p>
        )}
        <div className="divide-y divide-neutral-100">
          {job.applications.map((app) => {
            const badge = appStatusLabel[app.status];
            const confirmWithId = confirmApplication.bind(null, app.id);
            const rejectWithId = rejectApplication.bind(null, app.id);
            return (
              <div key={app.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold">{app.worker.name}</p>
                  <p className="text-xs text-neutral-500">
                    {app.worker.email}
                    {app.worker.phone ? ` ・ ${app.worker.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
                    {badge.text}
                  </span>
                  {app.status === "APPLIED" && (
                    <>
                      <form action={confirmWithId}>
                        <button
                          type="submit"
                          className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white"
                        >
                          確定
                        </button>
                      </form>
                      <form action={rejectWithId}>
                        <button
                          type="submit"
                          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-500"
                        >
                          不採用
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
        <h2 className="mb-3 text-sm font-bold">勤怠・シフト状況</h2>
        {job.shifts.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-400">確定したシフトはありません</p>
        )}
        <div className="divide-y divide-neutral-100">
          {job.shifts.map((shift) => {
            const badge = shiftStatusLabel[shift.status];
            const addAdjustmentWithIds = shift.payout
              ? addPayoutAdjustment.bind(null, shift.payout.id, job.id)
              : null;
            return (
              <div key={shift.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{shift.worker.name}</p>
                    <p className="text-xs text-neutral-500">
                      {shift.checkInAt ? `出勤 ${formatDateTimeJP(shift.checkInAt)}` : "未出勤"}
                      {shift.checkOutAt ? ` / 退勤 ${formatDateTimeJP(shift.checkOutAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {shift.payout && (
                      <span className="text-xs font-bold text-accent">
                        {formatYen(finalPayoutAmount(shift.payout))}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>

                {shift.payout && (
                  <div className="mt-2 rounded-xl bg-neutral-50 p-3">
                    <p className="mb-1.5 text-[11px] text-neutral-500">
                      基本給 {formatYen(shift.payout.amount)}({shift.payout.hoursWorked.toFixed(1)}
                      時間)
                    </p>

                    {shift.payout.adjustments.length > 0 && (
                      <ul className="mb-2 flex flex-col gap-1">
                        {shift.payout.adjustments.map((adj) => {
                          const deleteWithIds = deletePayoutAdjustment.bind(null, adj.id, job.id);
                          return (
                            <li key={adj.id} className="flex items-center justify-between text-xs">
                              <span className="text-neutral-600">{adj.label}</span>
                              <span className="flex items-center gap-2">
                                <span
                                  className={adj.amount >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}
                                >
                                  {adj.amount >= 0 ? "+" : ""}
                                  {formatYen(adj.amount)}
                                </span>
                                <form action={deleteWithIds}>
                                  <button type="submit" className="text-neutral-300 hover:text-neutral-500">
                                    <X size={13} />
                                  </button>
                                </form>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {addAdjustmentWithIds && (
                      <form action={addAdjustmentWithIds} className="flex flex-wrap items-center gap-1.5">
                        <select
                          name="label"
                          defaultValue=""
                          required
                          className="rounded-lg border border-neutral-300 px-2 py-1 text-xs"
                        >
                          <option value="" disabled>
                            項目を選択
                          </option>
                          {ADJUSTMENT_PRESETS.map((preset) => (
                            <option key={preset} value={preset}>
                              {preset}
                            </option>
                          ))}
                        </select>
                        <input
                          name="amount"
                          type="number"
                          required
                          placeholder="金額(円)"
                          title="加算はプラス、減給はマイナスで入力してください"
                          className="w-28 rounded-lg border border-neutral-300 px-2 py-1 text-xs"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white"
                        >
                          追加
                        </button>
                        <span className="text-[10px] text-neutral-400">減給はマイナスで入力</span>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
