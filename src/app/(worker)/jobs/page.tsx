import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import JobCard from "@/components/JobCard";
import { JOB_CATEGORIES } from "@/lib/job-categories";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();
  const { category } = await searchParams;

  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      workDate: { gte: new Date(new Date().toDateString()) },
      ...(category ? { category } : {}),
    },
    orderBy: { workDate: "asc" },
    include: {
      applications: true,
    },
  });

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-1 text-xl font-black">案件をさがす</h1>
      <p className="mb-4 text-sm text-neutral-500">
        気になる案件に応募して、すぐに働こう
      </p>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/jobs"
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
            !category ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
          }`}
        >
          すべて
        </Link>
        {JOB_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/jobs?category=${encodeURIComponent(c)}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              category === c ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {jobs.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-neutral-400 ring-1 ring-neutral-200">
          該当する案件はありません
        </p>
      )}

      <div className="flex flex-col gap-3">
        {jobs.map((job) => {
          const confirmedCount = job.applications.filter(
            (a) => a.status === "CONFIRMED"
          ).length;
          const myApplication = job.applications.find(
            (a) => a.workerId === user?.id
          );
          return (
            <JobCard
              key={job.id}
              job={{
                id: job.id,
                title: job.title,
                clientCompany: job.clientCompany,
                location: job.location,
                workDate: job.workDate,
                startTime: job.startTime,
                endTime: job.endTime,
                hourlyWage: job.hourlyWage,
                remainingSlots: Math.max(job.capacity - confirmedCount, 0),
                category: job.category,
                applicationStatus: myApplication?.status,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
