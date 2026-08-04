"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

export async function signupAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const lineName = String(formData.get("lineName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !phone || !lineName || password.length < 6) {
    return { error: "氏名・メールアドレス・電話番号・LINE名と6文字以上のパスワードを入力してください" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "WORKER",
      workerProfile: { create: { lineName } },
    },
  });

  await createSession(user.id);
  redirect("/jobs");
}

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/jobs");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
