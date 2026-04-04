import { briefTimezone } from "@/config/brief";
import type { DateRange } from "@/types/brief";

export function getRolling24HourRange(now = new Date()): DateRange {
  return {
    end: now,
    start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  };
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatLocalScheduleLabel(): string {
  return `08:00 ${briefTimezone}`;
}

export function formatDisplayDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: briefTimezone,
  }).format(new Date(value));
}

export function formatDisplayRange(start: Date, end: Date): string {
  return `${formatDisplayDateTime(start)} 至 ${formatDisplayDateTime(end)}`;
}
