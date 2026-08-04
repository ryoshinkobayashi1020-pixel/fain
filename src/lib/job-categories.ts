export const JOB_CATEGORIES = [
  "倉庫・軽作業",
  "イベント",
  "引越し",
  "オフィスワーク",
  "飲食",
  "販売・接客",
  "清掃",
  "警備",
  "建設・工事",
  "その他",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];
