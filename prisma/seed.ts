import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  await prisma.payout.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.user.create({
    data: {
      role: "ADMIN",
      name: "田中 花子",
      email: "admin@finetech.co.jp",
      passwordHash: adminPasswordHash,
      phone: "03-1234-5678",
    },
  });

  const sato = await prisma.user.create({
    data: {
      role: "WORKER",
      name: "佐藤 健太",
      email: "sato@example.com",
      passwordHash,
      phone: "090-1111-2222",
      workerProfile: { create: { station: "品川駅", skills: "倉庫作業,軽作業", lineName: "けんた" } },
    },
  });

  const suzuki = await prisma.user.create({
    data: {
      role: "WORKER",
      name: "鈴木 美咲",
      email: "suzuki@example.com",
      passwordHash,
      phone: "090-3333-4444",
      workerProfile: { create: { station: "渋谷駅", skills: "接客,イベント運営", lineName: "みさきん" } },
    },
  });

  const yamada = await prisma.user.create({
    data: {
      role: "WORKER",
      name: "山田 大輔",
      email: "yamada@example.com",
      passwordHash,
      phone: "090-5555-6666",
      workerProfile: { create: { station: "新宿駅", skills: "引越し,力仕事", lineName: "だいすけ0912" } },
    },
  });

  const job1 = await prisma.job.create({
    data: {
      title: "倉庫内での仕分け・梱包作業",
      description:
        "食品を扱う倉庫内で、仕分け・梱包・検品作業をお願いします。\n未経験者歓迎、動きやすい服装でお越しください。\n集合場所: 倉庫正面入口",
      clientCompany: "株式会社サンプル物流",
      location: "東京都江東区",
      workDate: daysFromNow(1),
      startTime: "09:00",
      endTime: "17:00",
      hourlyWage: 1300,
      capacity: 5,
      category: "倉庫・軽作業",
      createdById: admin.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "展示会イベント運営スタッフ",
      description:
        "都内展示会場での来場者案内・受付業務です。\n私服可(制服貸与あり)。立ち仕事が中心です。",
      clientCompany: "ABCイベント企画株式会社",
      location: "東京都港区",
      workDate: daysFromNow(3),
      startTime: "10:00",
      endTime: "19:00",
      hourlyWage: 1400,
      capacity: 3,
      category: "イベント",
      createdById: admin.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: "引っ越し作業スタッフ",
      description: "一般家庭の引っ越し補助作業です。荷物の運搬がメインになります。",
      clientCompany: "らくらく引越センター",
      location: "東京都世田谷区",
      workDate: daysFromNow(0),
      startTime: "08:00",
      endTime: "16:00",
      hourlyWage: 1500,
      capacity: 2,
      category: "引越し",
      createdById: admin.id,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: "データ入力・オフィス軽作業",
      description: "オフィス内でのデータ入力、書類整理をお願いします。",
      clientCompany: "フューチャーオフィス株式会社",
      location: "東京都千代田区",
      workDate: daysFromNow(5),
      startTime: "09:30",
      endTime: "17:30",
      hourlyWage: 1200,
      capacity: 4,
      category: "オフィスワーク",
      createdById: admin.id,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: "飲食店ホールスタッフ",
      description: "ランチタイムのホール業務(接客・配膳・片付け)をお願いします。",
      clientCompany: "レストランひまわり",
      location: "東京都渋谷区",
      workDate: daysFromNow(-1),
      startTime: "11:00",
      endTime: "15:00",
      hourlyWage: 1250,
      capacity: 2,
      status: "CLOSED",
      category: "飲食",
      createdById: admin.id,
    },
  });

  // 佐藤: job1 に応募中(未確定) -> 管理画面で確定/不採用を試せる
  await prisma.application.create({
    data: { jobId: job1.id, workerId: sato.id, status: "APPLIED" },
  });

  // 鈴木: job2 が確定済み、シフトは出勤前 -> ワーカー画面でチェックインを試せる
  await prisma.application.create({
    data: { jobId: job2.id, workerId: suzuki.id, status: "CONFIRMED" },
  });
  await prisma.shift.create({
    data: { jobId: job2.id, workerId: suzuki.id, status: "SCHEDULED" },
  });

  // 山田: job3 が確定済み、既に出勤中 -> ワーカー画面でチェックアウトを試せる
  await prisma.application.create({
    data: { jobId: job3.id, workerId: yamada.id, status: "CONFIRMED" },
  });
  await prisma.shift.create({
    data: {
      jobId: job3.id,
      workerId: yamada.id,
      status: "CHECKED_IN",
      checkInAt: new Date(new Date().setHours(8, 0, 0, 0)),
    },
  });

  // 山田: job5 は勤務完了・給与支払い済み -> 収入履歴のサンプル
  await prisma.application.create({
    data: { jobId: job5.id, workerId: yamada.id, status: "COMPLETED" },
  });
  const pastShift = await prisma.shift.create({
    data: {
      jobId: job5.id,
      workerId: yamada.id,
      status: "CHECKED_OUT",
      checkInAt: new Date(new Date(daysFromNow(-1)).setHours(11, 0, 0, 0)),
      checkOutAt: new Date(new Date(daysFromNow(-1)).setHours(15, 0, 0, 0)),
    },
  });
  await prisma.payout.create({
    data: {
      shiftId: pastShift.id,
      hoursWorked: 4,
      hourlyWage: job5.hourlyWage,
      amount: 4 * job5.hourlyWage,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  console.log("シードデータの投入が完了しました");
  console.log("管理者ログイン: admin@finetech.co.jp / admin1234");
  console.log("スタッフログイン例: sato@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
