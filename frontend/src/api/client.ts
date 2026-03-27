import axios from "axios";
import { ZodError } from "zod";

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
});

function flattenDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string" && first.trim()) {
      return first;
    }
    if (first && typeof first === "object") {
      const msg = (first as { msg?: unknown }).msg;
      if (typeof msg === "string" && msg.trim()) {
        return msg;
      }
    }
  }
  return null;
}

export function pickErrorMsg(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    return flattenDetail(detail) ?? "服务繁忙，请稍后再试";
  }
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "提交内容格式不正确";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "发生未知错误";
}
