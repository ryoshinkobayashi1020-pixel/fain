"use server";

import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";

export type AdminSettingsState = { error?: string; success?: string } | undefined;

export async function updateAdminCredentialsAction(
  _prevState: AdminSettingsState,
  formData: FormData,
): Promise<AdminSettingsState> {
  const admin = await requireUser("ADMIN");
  if (!admin) return { error: "管理者としてログインし直してください" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordConfirmation = String(formData.get("newPasswordConfirmation") ?? "");

  if (!email || !currentPassword) {
    return { error: "メールアドレスと現在のパスワードを入力してください" };
  }
  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    return { error: "現在のパスワードが正しくありません" };
  }
  if (newPassword && newPassword.length < 8) {
    return { error: "新しいパスワードは8文字以上で入力してください" };
  }
  if (newPassword !== newPasswordConfirmation) {
    return { error: "新しいパスワードが一致しません" };
  }
  if (admin.mustChangeCredentials && !newPassword) {
    return { error: "初回設定では新しいパスワードの登録が必要です" };
  }
  if (admin.mustChangeCredentials && email === admin.email) {
    return { error: "初回設定では新しいメールアドレスを登録してください" };
  }

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== admin.id) {
    return { error: "このメールアドレスは既に使用されています" };
  }

  const passwordChanged = Boolean(newPassword);
  const data: {
    email: string;
    passwordHash?: string;
    mustChangeCredentials?: boolean;
  } = { email };
  if (passwordChanged) data.passwordHash = await hashPassword(newPassword);
  if (admin.mustChangeCredentials) data.mustChangeCredentials = false;

  await prisma.user.update({ where: { id: admin.id }, data });

  if (passwordChanged) {
    await prisma.session.deleteMany({ where: { userId: admin.id } });
    await createSession(admin.id, false);
  }

  return {
    success: passwordChanged
      ? "管理者のメールアドレスとパスワードを変更しました"
      : "管理者のメールアドレスを変更しました",
  };
}
