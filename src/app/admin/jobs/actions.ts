"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { formatDateJP, formatYen } from "@/lib/format";

function parseJobForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const clientCompany = String(formData.get("clientCompany") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const hourlyWage = Number(formData.get("hourlyWage") ?? 0);
  const capacity = Number(formData.get("capacity") ?? 1);
  const category = String(formData.get("category") ?? "").trim();

  if (!title || !clientCompany || !location || !workDate || !startTime || !endTime) {
    return null;
  }

  return {
    title,
    clientCompany,
    location,
    description,
    workDate: new Date(workDate),
    startTime,
    endTime,
    hourlyWage: Math.max(hourlyWage, 0),
    capacity: Math.max(capacity, 1),
    category: category || null,
  };
}

export async function createJob(formData: FormData) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  const data = parseJobForm(formData);
  if (!data) return;

  const job = await prisma.job.create({
    data: { ...data, createdById: admin.id },
  });

  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs/${job.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  const data = parseJobForm(formData);
  if (!data) return;

  await prisma.job.update({ where: { id: jobId }, data });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  redirect(`/admin/jobs/${jobId}`);
}

export async function closeJob(jobId: string) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  await prisma.job.update({ where: { id: jobId }, data: { status: "CLOSED" } });
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function reopenJob(jobId: string) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  await prisma.job.update({ where: { id: jobId }, data: { status: "OPEN" } });
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
}

export async function confirmApplication(applicationId: string) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { include: { applications: true } }, worker: true },
  });
  if (!application) return;

  const confirmedCount = application.job.applications.filter(
    (a) => a.status === "CONFIRMED"
  ).length;
  if (confirmedCount >= application.job.capacity) return;

  const willReachCapacity = confirmedCount + 1 >= application.job.capacity;

  await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status: "CONFIRMED" },
    }),
    prisma.shift.upsert({
      where: {
        jobId_workerId: { jobId: application.jobId, workerId: application.workerId },
      },
      update: {},
      create: { jobId: application.jobId, workerId: application.workerId },
    }),
    ...(willReachCapacity
      ? [prisma.job.update({ where: { id: application.jobId }, data: { status: "CLOSED" } })]
      : []),
  ]);

  const job = application.job;
  await sendEmail({
    to: application.worker.email,
    subject: `【ファインテック】案件確定のお知らせ「${job.title}」`,
    body: [
      `${application.worker.name} 様`,
      "",
      "以下の案件へのご応募が確定しましたのでお知らせいたします。",
      "",
      `案件名: ${job.title}`,
      `取引先企業: ${job.clientCompany}`,
      `勤務日時: ${formatDateJP(job.workDate)} ${job.startTime}〜${job.endTime}`,
      `勤務地: ${job.location}`,
      `時給: ${formatYen(job.hourlyWage)}`,
      "",
      "当日はマイページのシフト画面から出勤・退勤の打刻をお願いいたします。",
      "",
      "ファインテック株式会社",
    ].join("\n"),
  });

  revalidatePath(`/admin/jobs/${application.jobId}`);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${application.jobId}`);
  revalidatePath("/mypage");
  revalidatePath("/mypage/applications");
  revalidatePath("/mypage/shifts");
}

export async function rejectApplication(applicationId: string) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });

  await prisma.shift.deleteMany({
    where: { jobId: application.jobId, workerId: application.workerId, status: "SCHEDULED" },
  });

  revalidatePath(`/admin/jobs/${application.jobId}`);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${application.jobId}`);
  revalidatePath("/mypage");
  revalidatePath("/mypage/applications");
  revalidatePath("/mypage/shifts");
}

export async function addPayoutAdjustment(payoutId: string, jobId: string, formData: FormData) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (!label || !amount) return;

  await prisma.payoutAdjustment.create({
    data: { payoutId, label, amount: Math.round(amount) },
  });

  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin/payroll");
  revalidatePath("/admin/payroll/print");
  revalidatePath("/mypage/earnings");
}

export async function deletePayoutAdjustment(adjustmentId: string, jobId: string) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  await prisma.payoutAdjustment.delete({ where: { id: adjustmentId } });

  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/admin/payroll");
  revalidatePath("/admin/payroll/print");
  revalidatePath("/mypage/earnings");
}
