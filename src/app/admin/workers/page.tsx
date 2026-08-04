import { prisma } from "@/lib/prisma";

export default async function AdminWorkersPage() {
  const workers = await prisma.user.findMany({
    where: { role: "WORKER" },
    include: {
      workerProfile: true,
      _count: {
        select: { applications: true, shifts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-black">スタッフ管理</h1>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">氏名</th>
              <th className="px-4 py-2.5 font-medium">連絡先</th>
              <th className="px-4 py-2.5 font-medium">最寄り駅</th>
              <th className="px-4 py-2.5 font-medium">応募数</th>
              <th className="px-4 py-2.5 font-medium">勤務実績</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {workers.map((w) => (
              <tr key={w.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-semibold">{w.name}</td>
                <td className="px-4 py-3 text-xs text-neutral-600">
                  {w.email}
                  {w.phone ? <div>{w.phone}</div> : null}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">
                  {w.workerProfile?.station || "-"}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">{w._count.applications}件</td>
                <td className="px-4 py-3 text-xs text-neutral-600">{w._count.shifts}件</td>
              </tr>
            ))}
          </tbody>
        </table>

        {workers.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">登録スタッフはいません</p>
        )}
      </div>
    </div>
  );
}
