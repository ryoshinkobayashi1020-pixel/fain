"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth-actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          IDまたはメールアドレス
        </label>
        <input
          name="email"
          type="text"
          required
          placeholder="管理者IDまたはメールアドレス"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          パスワード
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
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
        {pending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
