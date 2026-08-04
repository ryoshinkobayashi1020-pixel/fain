"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function checkIn(shiftId: string) {
  const user = await requireUser("WORKER");
  if (!user) redirect("/login");

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift || shift.workerId !== user.id || shift.status !== "SCHEDULED") return;

  await prisma.shift.update({
    where: { id: shiftId },
    data: { status: "CHECKED_IN", checkInAt: new Date() },
  });

  revalidatePath("/mypage/shifts");
}

export async function checkOut(shiftId: string) {
  const user = await requireUser("WORKER");
  if (!user) redirect("/login");

  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { job: true },
  });
  if (!shift || shift.workerId !== user.id || shift.status !== "CHECKED_IN" || !shift.checkInAt) {
    return;
  }

  const checkOutAt = new Date();
  const hoursWorked = Math.max(
    (checkOutAt.getTime() - shift.checkInAt.getTime()) / (1000 * 60 * 60),
    0
  );
  const amount = Math.round(hoursWorked * shift.job.hourlyWage);

  await prisma.$transaction([
    prisma.shift.update({
      where: { id: shiftId },
      data: { status: "CHECKED_OUT", checkOutAt },
    }),
    prisma.payout.upsert({
      where: { shiftId },
      update: { hoursWorked, hourlyWage: shift.job.hourlyWage, amount },
      create: {
        shiftId,
        hoursWorked,
        hourlyWage: shift.job.hourlyWage,
        amount,
        status: "PENDING",
      },
    }),
    prisma.application.updateMany({
      where: { jobId: shift.jobId, workerId: shift.workerId },
      data: { status: "COMPLETED" },
    }),
  ]);

  revalidatePath("/mypage/shifts");
  revalidatePath("/mypage/earnings");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser("WORKER");
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const lineName = String(formData.get("lineName") ?? "").trim();
  const station = String(formData.get("station") ?? "").trim();
  const skills = String(formData.get("skills") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!name || !phone || !lineName) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone,
      workerProfile: {
        upsert: {
          update: { lineName, station: station || null, skills: skills || null, bio: bio || null },
          create: { lineName, station: station || null, skills: skills || null, bio: bio || null },
        },
      },
    },
  });

  revalidatePath("/mypage");
  revalidatePath("/mypage/profile");
  redirect("/mypage");
}
