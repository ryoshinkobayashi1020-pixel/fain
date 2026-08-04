"use client";

import { useActionState } from "react";
import { updateAdminCredentialsAction } from "./actions";

export default function AdminSettingsForm({
  email,
  firstLogin,
}: {
  email: string;
  firstLogin: boolean;
}) {
  const [state, action, pending] = useActionState(updateAdminCredentialsAction, undefined);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">管理者メールアドレス</label>
        <input name="email" type="email" required defaultValue={email} autoComplete="email" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>

      <div className="border-t border-neutral-100 pt-5">
          <p className="mb-3 text-sm font-bold">
            {firstLogin ? "新しいパスワード" : "パスワード変更（任意）"}
          </p>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">新しいパスワード</label>
            <input name="newPassword" type="password" required={firstLogin} minLength={8} autoComplete="new-password" placeholder={firstLogin ? "8文字以上" : "変更しない場合は空欄"} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">新しいパスワード（確認）</label>
            <input name="newPasswordConfirmation" type="password" required={firstLogin} minLength={8} autoComplete="new-password" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-5">
        <label className="mb-1 block text-sm font-medium text-neutral-700">現在のパスワード（変更確認）</label>
        <input name="currentPassword" type="password" required autoComplete="current-password" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}

      <button type="submit" disabled={pending} className="w-full rounded-full bg-accent py-3 font-bold text-white hover:bg-accent-dark disabled:opacity-60 sm:w-auto sm:px-8">
        {pending ? "変更中..." : "管理者情報を変更"}
      </button>
    </form>
  );
}
