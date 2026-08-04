"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth-actions";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          氏名
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="山田 太郎"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          メールアドレス
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          電話番号
        </label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="090-1234-5678"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          LINE名
        </label>
        <input
          name="lineName"
          type="text"
          required
          placeholder="LINEの表示名"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-xs text-neutral-400">
          案件確定後の連絡はLINEで行いますので、正確に入力してください
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          パスワード
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="6文字以上"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full rounded-full bg-accent py-3 text-base font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "登録中..." : "登録してはじめる"}
      </button>
    </form>
  );
}
