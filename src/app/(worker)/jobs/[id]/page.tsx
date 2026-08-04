import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Clock, JapaneseYen, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDateJP } from "@/lib/format";
import { applyToJob, cancelApplication } from "../actions";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const job = await prisma.job.findUnique({
    where: { id },
    include: { applications: true },
  });

  if (!job) notFound();

  const confirmedCount = job.applications.filter((a) => a.status === "CONFIRMED").length;
  const remainingSlots = Math.max(job.capacity - confirmedCount, 0);
  const myApplication = job.applications.find((a) => a.workerId === user?.id);

  const applyWithId = applyToJob.bind(null, job.id);
  const cancelWithId = cancelApplication.bind(null, job.id);

  return (
    <div className="pb-28">
      <div className="border-b border-neutral-200 bg-white px-4 py-3">
        <Link href="/jobs" className="flex items-center gap-1 text-sm text-neutral-500">
          <ArrowLeft size={16} /> 案件一覧に戻る
        </Link>
      </div>

      <div className="px-4 pt-5">
        <div className="mb-1 flex items-center gap-1.5">
          <p className="flex items-center gap-1 text-xs font-semibold text-neutral-400">
            <Building2 size={13} /> {job.clientCompany}
          </p>
          {job.category && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-accent">
              {job.category}
            </span>
          )}
        </div>
        <h1 className="mb-4 text-xl font-black leading-snug">{job.title}</h1>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-neutral-400">
              <JapaneseYen size={12} /> 時給
            </p>
            <p className="text-lg font-black text-accent">
              ¥{job.hourlyWage.toLocaleString("ja-JP")}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-neutral-400">
              <Users size={12} /> 募集人数
            </p>
            <p className="text-lg font-black">
              残り{remainingSlots}名 <span className="text-xs font-medium text-neutral-400">/ {job.capacity}名</span>
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-neutral-400">
              <Clock size={12} /> 日時
            </p>
            <p className="text-sm font-bold">
              {formatDateJP(job.workDate)} {job.startTime}〜{job.endTime}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-neutral-400">
              <MapPin size={12} /> 勤務地
            </p>
            <p className="text-sm font-bold">{job.location}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-neutral-200">
          <h2 className="mb-2 text-sm font-bold">お仕事内容</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
            {job.description}
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-lg border-t border-neutral-200 bg-white p-4">
        {!myApplication && job.status === "OPEN" && remainingSlots > 0 && (
          <form action={applyWithId}>
            <button
              type="submit"
              className="w-full rounded-full bg-accent py-3.5 text-base font-bold text-white active:scale-[0.99]"
            >
              この案件に応募する
            </button>
          </form>
        )}

        {!myApplication && (job.status !== "OPEN" || remainingSlots <= 0) && (
          <button
            disabled
            className="w-full rounded-full bg-neutral-200 py-3.5 text-base font-bold text-neutral-500"
          >
            募集終了
          </button>
        )}

        {myApplication && myApplication.status === "APPLIED" && (
          <div className="flex items-center gap-2">
            <p className="flex-1 rounded-full bg-amber-50 py-3.5 text-center text-sm font-bold text-amber-700">
              応募中(確定をお待ちください)
            </p>
            <form action={cancelWithId}>
              <button
                type="submit"
                className="rounded-full border border-neutral-300 px-4 py-3.5 text-sm font-bold text-neutral-500"
              >
                取消
              </button>
            </form>
          </div>
        )}

        {myApplication && myApplication.status === "CONFIRMED" && (
          <div className="flex items-center gap-2">
            <p className="flex-1 rounded-full bg-emerald-50 py-3.5 text-center text-sm font-bold text-emerald-700">
              参加確定しています
            </p>
            <form action={cancelWithId}>
              <button
                type="submit"
                className="rounded-full border border-neutral-300 px-4 py-3.5 text-sm font-bold text-neutral-500"
              >
                取消
              </button>
            </form>
          </div>
        )}

        {myApplication &&
          ["REJECTED", "CANCELED", "COMPLETED"].includes(myApplication.status) && (
            <p className="w-full rounded-full bg-neutral-100 py-3.5 text-center text-sm font-bold text-neutral-500">
              {myApplication.status === "REJECTED" && "今回は不採用でした"}
              {myApplication.status === "CANCELED" && "応募をキャンセルしました"}
              {myApplication.status === "COMPLETED" && "お疲れ様でした"}
            </p>
          )}
      </div>
    </div>
  );
}
