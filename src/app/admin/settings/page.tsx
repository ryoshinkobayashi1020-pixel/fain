import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import AdminSettingsForm from "./AdminSettingsForm";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>;
}) {
  const admin = await requireUser("ADMIN");
  if (!admin) redirect("/login");
  const params = await searchParams;
  const firstLogin = admin.mustChangeCredentials || params.first === "1";

  return (
    <div>
      <h1 className="text-xl font-black">管理者設定</h1>
      {firstLogin ? (
        <div className="mb-5 mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 ring-1 ring-amber-200">
          初回ログインです。安全のため、新しい管理者メールアドレスと新しいパスワードを登録してください。
        </div>
      ) : (
        <p className="mb-5 mt-1 text-sm text-neutral-500">
          現在ログインしている管理者アカウントのメールアドレスとパスワードを変更できます。
        </p>
      )}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200 sm:p-6">
        <AdminSettingsForm email={admin.email} firstLogin={firstLogin} />
      </div>
    </div>
  );
}
