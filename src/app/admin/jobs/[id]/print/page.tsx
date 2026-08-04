import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateJP, formatYen } from "@/lib/format";
import PrintButton from "@/components/PrintButton";

export default async function JobApplicantsPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        where: { status: "CONFIRMED" },
        include: { worker: { include: { workerProfile: true } } },
        orderBy: { appliedAt: "asc" },
      },
    },
  });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 print:px-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-bold">応募者一覧(印刷用)</h1>
        <PrintButton label="この一覧を印刷する" />
      </div>

      <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200 print:rounded-none print:p-0 print:ring-0">
        <h2 className="text-xl font-black">{job.title}</h2>
        <p className="mb-4 text-sm text-neutral-600">
          {job.clientCompany} ・ {formatDateJP(job.workDate)} {job.startTime}〜{job.endTime} ・{" "}
          {job.location} ・ {formatYen(job.hourlyWage)}/時 ・ 確定 {job.applications.length}/
          {job.capacity}名
        </p>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-800 text-left">
              <th className="py-2 pr-3">氏名</th>
              <th className="py-2 pr-3">電話番号</th>
              <th className="py-2 pr-3">メールアドレス</th>
              <th className="py-2 pr-3">LINE名</th>
              <th className="py-2 pr-3">最寄り駅</th>
            </tr>
          </thead>
          <tbody>
            {job.applications.map((app) => (
              <tr key={app.id} className="border-b border-neutral-200">
                <td className="py-2 pr-3 font-medium">{app.worker.name}</td>
                <td className="py-2 pr-3">{app.worker.phone || "-"}</td>
                <td className="py-2 pr-3">{app.worker.email}</td>
                <td className="py-2 pr-3">{app.worker.workerProfile?.lineName || "-"}</td>
                <td className="py-2 pr-3">{app.worker.workerProfile?.station || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {job.applications.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">確定した応募者はいません</p>
        )}
      </div>
    </div>
  );
}
