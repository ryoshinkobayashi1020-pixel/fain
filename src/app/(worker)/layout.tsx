import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth-actions";
import BottomNav from "@/components/BottomNav";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "WORKER") redirect("/admin");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-neutral-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <Image src="/logo.png" alt="ファインテック株式会社" width={512} height={94} className="h-6 w-auto" priority />
        <form action={logoutAction} className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">{user.name} さん</span>
          <button
            type="submit"
            className="flex items-center gap-1 text-xs text-neutral-400"
          >
            <LogOut size={14} />
            ログアウト
          </button>
        </form>
      </header>

      <main className="flex-1 pb-4">{children}</main>

      <BottomNav />
    </div>
  );
}
