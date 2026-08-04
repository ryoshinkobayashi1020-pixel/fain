import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/jobs");
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
          <p className="mt-2 text-sm text-neutral-500">
            応募者として新規登録
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
          <h2 className="mb-4 text-lg font-bold">新規登録</h2>
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-semibold text-accent">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
