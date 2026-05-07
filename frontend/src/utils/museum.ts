import dayjs from "dayjs";

export const exhibitionStatusOptions = ["展出中", "即将开展", "已结束"] as const;
export const visitStatusOptions = ["已预约", "已取消", "已完成"] as const;
export const commentStatusOptions = ["已发布", "待审核"] as const;

export function formatDate(value?: string | null, pattern = "YYYY-MM-DD") {
  if (!value) {
    return "-";
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(pattern) : value;
}

export function formatDateRange(start?: string | null, end?: string | null) {
  return `${formatDate(start, "YYYY.MM.DD")} - ${formatDate(end, "YYYY.MM.DD")}`;
}

export function excerpt(text: string, maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function statusColor(status: string) {
  if (status.includes("展出中") || status.includes("已发布") || status.includes("已完成")) {
    return "green";
  }
  if (status.includes("即将") || status.includes("待审核")) {
    return "blue";
  }
  if (status.includes("已结束") || status.includes("已取消")) {
    return "default";
  }
  if (status.includes("预约")) {
    return "gold";
  }
  return "cyan";
}

export function visitStatusColor(status: string) {
  if (status.includes("已预约")) {
    return "blue";
  }
  if (status.includes("已完成")) {
    return "green";
  }
  if (status.includes("已取消")) {
    return "default";
  }
  return "gold";
}
