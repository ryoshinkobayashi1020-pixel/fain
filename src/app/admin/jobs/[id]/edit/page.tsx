import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateJob } from "../../actions";
import JobForm from "@/components/JobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  const updateWithId = updateJob.bind(null, job.id);

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/admin/jobs/${job.id}`} className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> 案件詳細に戻る
      </Link>
      <h1 className="mb-4 text-xl font-black">案件を編集</h1>

      <JobForm
        action={updateWithId}
        submitLabel="変更を保存する"
        defaultValues={{
          title: job.title,
          clientCompany: job.clientCompany,
          location: job.location,
          category: job.category,
          workDate: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(job.workDate),
          startTime: job.startTime,
          endTime: job.endTime,
          hourlyWage: job.hourlyWage,
          capacity: job.capacity,
          description: job.description,
        }}
      />
    </div>
  );
}
