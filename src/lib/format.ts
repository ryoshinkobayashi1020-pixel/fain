export function formatDateJP(date: Date) {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
}

export function formatYen(amount: number) {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDateTimeJP(date: Date) {
  return `${formatDateJP(date)} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthJP(key: string) {
  const [year, month] = key.split("-");
  return `${year}年${Number(month)}月`;
}
