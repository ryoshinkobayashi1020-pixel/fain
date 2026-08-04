"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string } | undefined;
export type ResetPasswordFormState = { error?: string; success?: string } | undefined;

function normalizeName(value: string) {
  return value.replace(/[\s\u3000]+/g, "").toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

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

export async function resetWorkerPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (!email || !name || !phone || password.length < 8) {
    return { error: "メールアドレス・本名・電話番号と8文字以上の新しいパスワードを入力してください" };
  }
  if (password !== passwordConfirmation) {
    return { error: "新しいパスワードが一致しません" };
  }

  const worker = await prisma.user.findFirst({
    where: { email, role: "WORKER" },
  });
  const identityMatches =
    worker &&
    normalizeName(worker.name) === normalizeName(name) &&
    normalizePhone(worker.phone ?? "") === normalizePhone(phone);

  if (!worker || !identityMatches) {
    return { error: "入力された応募者情報を確認できませんでした" };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: worker.id }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: worker.id } }),
  ]);

  return { success: "パスワードを変更しました。新しいパスワードでログインしてください。" };
}
