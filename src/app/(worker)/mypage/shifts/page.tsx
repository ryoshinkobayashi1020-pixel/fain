import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDateJP, formatDateTimeJP } from "@/lib/format";
import { checkIn, checkOut } from "../actions";

const statusLabel: Record<string, { text: string; className: string }> = {
  SCHEDULED: { text: "出勤前", className: "bg-neutral-100 text-neutral-500" },
  CHECKED_IN: { text: "勤務中", className: "bg-amber-100 text-amber-700" },
  CHECKED_OUT: { text: "退勤済み", className: "bg-emerald-100 text-emerald-700" },
  NO_SHOW: { text: "無断欠勤", className: "bg-red-100 text-red-700" },
};

export default async function ShiftsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const shifts = await prisma.shift.findMany({
    where: { workerId: user.id },
    include: { job: true, payout: true },
    orderBy: { job: { workDate: "asc" } },
  });

  return (
    <div className="px-4 pt-4">
      <Link href="/mypage" className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> マイページ
      </Link>
      <h1 className="mb-4 text-xl font-black">シフト・勤怠</h1>

      {shifts.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-neutral-400 ring-1 ring-neutral-200">
          確定しているシフトはありません
        </p>
      )}

      <div className="flex flex-col gap-3">
        {shifts.map((shift) => {
          const badge = statusLabel[shift.status];
          const checkInWithId = checkIn.bind(null, shift.id);
          const checkOutWithId = checkOut.bind(null, shift.id);

          return (
            <div key={shift.id} className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-neutral-400">{shift.job.clientCompany}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
                  {badge.text}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-bold">{shift.job.title}</h3>
              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                <MapPin size={12} /> {shift.job.location}
              </p>
              <p className="mb-3 text-xs text-neutral-500">
                {formatDateJP(shift.job.workDate)} {shift.job.startTime}〜{shift.job.endTime}
              </p>

              {shift.status === "SCHEDULED" && (
                <form action={checkInWithId}>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-accent py-2.5 text-sm font-bold text-white"
                  >
                    出勤する(チェックイン)
                  </button>
                </form>
              )}

              {shift.status === "CHECKED_IN" && (
                <>
                  <p className="mb-2 text-xs text-neutral-500">
                    出勤時刻: {shift.checkInAt && formatDateTimeJP(shift.checkInAt)}
                  </p>
                  <form action={checkOutWithId}>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-neutral-800 py-2.5 text-sm font-bold text-white"
                    >
                      退勤する(チェックアウト)
                    </button>
                  </form>
                </>
              )}

              {shift.status === "CHECKED_OUT" && shift.payout && (
                <div className="rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                  <p>
                    勤務時間: {shift.payout.hoursWorked.toFixed(1)}時間 / 給与:{" "}
                    <span className="font-bold text-accent">
                      ¥{shift.payout.amount.toLocaleString("ja-JP")}
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
