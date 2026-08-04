import Link from "next/link";
import { MapPin, Clock, JapaneseYen } from "lucide-react";
import { formatDateJP } from "@/lib/format";

export type JobCardData = {
  id: string;
  title: string;
  clientCompany: string;
  location: string;
  workDate: Date;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  remainingSlots: number;
  category?: string | null;
  applicationStatus?: "APPLIED" | "CONFIRMED" | "REJECTED" | "CANCELED" | "COMPLETED";
};

const statusLabel: Record<string, { text: string; className: string }> = {
  APPLIED: { text: "応募中", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { text: "確定", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { text: "不採用", className: "bg-neutral-200 text-neutral-500" },
  CANCELED: { text: "キャンセル済", className: "bg-neutral-200 text-neutral-500" },
  COMPLETED: { text: "完了", className: "bg-neutral-200 text-neutral-600" },
};

export default function JobCard({ job }: { job: JobCardData }) {
  const badge = job.applicationStatus ? statusLabel[job.applicationStatus] : null;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 transition active:scale-[0.99]"
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-neutral-400">{job.clientCompany}</p>
          {job.category && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-accent">
              {job.category}
            </span>
          )}
        </div>
        {badge && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
            {badge.text}
          </span>
        )}
      </div>
      <h3 className="mb-2 text-base font-bold leading-snug">{job.title}</h3>

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} /> {formatDateJP(job.workDate)} {job.startTime}-{job.endTime}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2.5">
        <span className="flex items-center gap-0.5 text-lg font-black text-accent">
          <JapaneseYen size={17} strokeWidth={2.6} />
          {job.hourlyWage.toLocaleString("ja-JP")}
          <span className="ml-0.5 text-xs font-medium text-neutral-500">/時</span>
        </span>
        <span className="text-xs font-semibold text-neutral-500">
          {job.remainingSlots > 0 ? `残り${job.remainingSlots}名` : "満員"}
        </span>
      </div>
    </Link>
  );
}
