import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, LayoutDashboard, Briefcase, Users, Wallet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth-actions";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "案件管理", icon: Briefcase },
  { href: "/admin/workers", label: "スタッフ管理", icon: Users },
  { href: "/admin/payroll", label: "給与管理", icon: Wallet },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/jobs");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="ファインテック株式会社" width={512} height={94} className="h-6 w-auto" priority />
            <span className="hidden text-sm font-bold text-neutral-400 sm:inline">管理画面</span>
          </div>
          <form action={logoutAction} className="flex items-center gap-3">
            <span className="hidden text-xs text-neutral-500 sm:inline">
              {user.name} さん
            </span>
            <button type="submit" className="flex items-center gap-1 text-xs text-neutral-400">
              <LogOut size={14} />
              ログアウト
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}
