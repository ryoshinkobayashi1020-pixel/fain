import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "../actions";

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="px-4 pt-4">
      <Link href="/mypage" className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> マイページ
      </Link>
      <h1 className="mb-4 text-xl font-black">プロフィール編集</h1>

      <form
        action={updateProfile}
        className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">氏名</span>
          <input name="name" required defaultValue={user.name} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">電話番号</span>
          <input name="phone" type="tel" required defaultValue={user.phone ?? ""} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">LINE名</span>
          <input
            name="lineName"
            required
            defaultValue={profile?.lineName ?? ""}
            placeholder="LINEの表示名"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">最寄り駅</span>
          <input
            name="station"
            defaultValue={profile?.station ?? ""}
            placeholder="例: 新宿駅"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">スキル・経験(カンマ区切り)</span>
          <input
            name="skills"
            defaultValue={profile?.skills ?? ""}
            placeholder="例: 倉庫作業,接客"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">自己紹介</span>
          <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ""} className={inputClass} />
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-full bg-accent py-3 text-base font-bold text-white"
        >
          保存する
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-neutral-400">{user.email}</p>
    </div>
  );
}
