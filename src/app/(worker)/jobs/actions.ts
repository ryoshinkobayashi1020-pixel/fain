"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function applyToJob(jobId: string) {
  const user = await requireUser("WORKER");
  if (!user) redirect("/login");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { applications: { where: { status: "CONFIRMED" } } },
  });
  if (!job || job.status !== "OPEN") return;
  if (job.applications.length >= job.capacity) return;

  await prisma.application.upsert({
    where: { jobId_workerId: { jobId, workerId: user.id } },
    update: { status: "APPLIED" },
    create: { jobId, workerId: user.id, status: "APPLIED" },
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/mypage/applications");
}

export async function cancelApplication(jobId: string) {
  const user = await requireUser("WORKER");
  if (!user) redirect("/login");

  await prisma.application.updateMany({
    where: { jobId, workerId: user.id, status: { in: ["APPLIED", "CONFIRMED"] } },
    data: { status: "CANCELED" },
  });

  await prisma.shift.deleteMany({
    where: { jobId, workerId: user.id, status: "SCHEDULED" },
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/mypage/applications");
}
