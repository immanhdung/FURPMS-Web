import dayjs from "dayjs";

export function formatDate(value: string | Date | undefined | null, pattern = "DD MMM YYYY"): string {
  if (!value) return "-";
  return dayjs(value).format(pattern);
}

export function formatDateTime(value: string | Date | undefined | null): string {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY HH:mm");
}

export function formatRelativeTime(value: string | Date | undefined | null): string {
  if (!value) return "-";
  const target = dayjs(value);
  const diffMinutes = dayjs().diff(target, "minute");

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = dayjs().diff(target, "hour");
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = dayjs().diff(target, "day");
  if (diffDays < 30) return `${diffDays}d ago`;

  return target.format("DD MMM YYYY");
}

export function formatCurrency(value: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(value);
}
