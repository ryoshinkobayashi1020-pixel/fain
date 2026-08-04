import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(
      user.role === "ADMIN"
        ? user.mustChangeCredentials
          ? "/admin/settings?first=1"
          : "/admin"
        : "/jobs",
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo.png"
            alt="ファインテック株式会社"
            width={512}
            height={94}
            priority
            className="mx-auto h-auto w-96"
          />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
          <h2 className="mb-4 text-lg font-bold">ログイン</h2>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="font-semibold text-accent">
            新規登録
          </Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link href="/forgot-password" className="font-semibold text-accent">
            パスワードを忘れた応募者はこちら
          </Link>
        </p>
      </div>
    </div>
  );
}
