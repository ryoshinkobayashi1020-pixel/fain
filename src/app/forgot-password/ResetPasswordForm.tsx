"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetWorkerPasswordAction } from "@/app/actions/auth-actions";

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetWorkerPasswordAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">メールアドレス</label>
        <input name="email" type="email" required autoComplete="email" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">本名</label>
        <input name="name" type="text" required autoComplete="name" placeholder="山田 太郎" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">電話番号</label>
        <input name="phone" type="tel" required autoComplete="tel" placeholder="090-1234-5678" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">新しいパスワード</label>
        <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8文字以上" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">新しいパスワード（確認）</label>
        <input name="passwordConfirmation" type="password" required minLength={8} autoComplete="new-password" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
          <p>{state.success}</p>
          <Link href="/login" className="mt-2 inline-block font-bold underline">ログイン画面へ</Link>
        </div>
      )}

      <button type="submit" disabled={pending || Boolean(state?.success)} className="mt-1 w-full rounded-full bg-accent py-3 font-bold text-white hover:bg-accent-dark disabled:opacity-60">
        {pending ? "確認中..." : "パスワードを変更"}
      </button>
    </form>
  );
}
