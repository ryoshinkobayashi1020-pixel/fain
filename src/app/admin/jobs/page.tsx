import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateJP, formatYen } from "@/lib/format";
import { JOB_CATEGORIES } from "@/lib/job-categories";

const statusLabel: Record<string, { text: string; className: string }> = {
  OPEN: { text: "募集中", className: "bg-emerald-100 text-emerald-700" },
  CLOSED: { text: "締め切り", className: "bg-neutral-200 text-neutral-500" },
  COMPLETED: { text: "終了済み", className: "bg-blue-100 text-blue-700" },
  CANCELED: { text: "中止", className: "bg-red-100 text-red-700" },
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const { category, status } = await searchParams;
  const selectedStatus = ["OPEN", "CLOSED", "COMPLETED", "CANCELED"].includes(status ?? "")
    ? status
    : undefined;

  const jobs = await prisma.job.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(selectedStatus ? { status: selectedStatus as "OPEN" | "CLOSED" | "COMPLETED" | "CANCELED" } : {}),
    },
    include: { applications: true },
    orderBy: { workDate: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black">案件管理</h1>
        <Link
          href="/admin/jobs/new"
          className="flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={16} /> 新規案件
        </Link>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {[
          { value: undefined, label: "すべて" },
          { value: "OPEN", label: "募集中" },
          { value: "CLOSED", label: "締め切り" },
          { value: "COMPLETED", label: "終了済み" },
          { value: "CANCELED", label: "中止" },
        ].map((item) => {
          const query = new URLSearchParams();
          if (item.value) query.set("status", item.value);
          if (category) query.set("category", category);
          return (
            <Link
              key={item.value ?? "ALL"}
              href={`/admin/jobs${query.size ? `?${query}` : ""}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                selectedStatus === item.value
                  ? "bg-accent text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href={selectedStatus ? `/admin/jobs?status=${selectedStatus}` : "/admin/jobs"}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
            !category ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
          }`}
        >
          すべて
        </Link>
        {JOB_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/admin/jobs?category=${encodeURIComponent(c)}${selectedStatus ? `&status=${selectedStatus}` : ""}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              category === c ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">案件名</th>
              <th className="px-4 py-2.5 font-medium">ジャンル</th>
              <th className="px-4 py-2.5 font-medium">日時</th>
              <th className="px-4 py-2.5 font-medium">時給</th>
              <th className="px-4 py-2.5 font-medium">応募状況</th>
              <th className="px-4 py-2.5 font-medium">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {jobs.map((job) => {
              const confirmed = job.applications.filter((a) => a.status === "CONFIRMED").length;
              const applied = job.applications.filter((a) => a.status === "APPLIED").length;
              const badge = statusLabel[job.status];
              return (
                <tr key={job.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/jobs/${job.id}`} className="font-semibold text-neutral-900">
                      {job.title}
                    </Link>
                    <p className="text-xs text-neutral-400">{job.clientCompany}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{job.category || "-"}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {formatDateJP(job.workDate)} {job.startTime}〜{job.endTime}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{formatYen(job.hourlyWage)}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    確定 {confirmed}/{job.capacity}
                    {applied > 0 && (
                      <span className="ml-1 text-amber-600">(未確定{applied})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {jobs.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">該当する案件はありません</p>
        )}
      </div>
    </div>
  );
}
