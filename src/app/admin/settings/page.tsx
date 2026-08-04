import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import AdminSettingsForm from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");

  return (
    <div>
      <h1 className="text-xl font-black">管理者設定</h1>
      <p className="mb-5 mt-1 text-sm text-neutral-500">
        管理者アカウントは1件のみです。ログイン用メールアドレスとパスワードを変更できます。
      </p>
      <div className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
        <AdminSettingsForm email={admin.email} />
      </div>
    </div>
  );
}
