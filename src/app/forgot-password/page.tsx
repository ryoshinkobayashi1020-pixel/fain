import Image from "next/image";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Image src="/logo.png" alt="ファインテック株式会社" width={512} height={94} priority className="mx-auto mb-8 h-auto w-96" />
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
          <h1 className="text-lg font-bold">応募者パスワード再設定</h1>
          <p className="mb-5 mt-2 text-sm leading-relaxed text-neutral-500">
            登録時の情報を入力してください。管理者アカウントはこの画面から変更できません。
          </p>
          <ResetPasswordForm />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-accent">ログイン画面に戻る</Link>
        </p>
      </div>
    </div>
  );
}
