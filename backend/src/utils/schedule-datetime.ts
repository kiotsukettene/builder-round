import { env } from "../config/env.js";

const WEEKDAY_TO_NUMBER: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface WallClockParts {
  dateStr: string;
  timeStr: string;
  dayOfWeek: number;
}

export function getAppTimezone(): string {
  return env.APP_TIMEZONE;
}

export function getDayOfWeekFromDateStr(dateStr: string): number {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr ?? "0");
  const month = Number(monthStr ?? "1");
  const day = Number(dayStr ?? "1");
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getWallClockParts(
  date: Date,
  timeZone: string = getAppTimezone(),
): WallClockParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour").padStart(2, "0");
  const minute = get("minute").padStart(2, "0");
  const weekday = get("weekday");

  const dateStr = `${year}-${month}-${day}`;

  return {
    dateStr,
    timeStr: `${hour}:${minute}`,
    dayOfWeek: WEEKDAY_TO_NUMBER[weekday] ?? getDayOfWeekFromDateStr(dateStr),
  };
}

export function addMinutesToTimeStr(timeStr: string, minutes: number): string {
  const [hoursStr, minsStr] = timeStr.split(":");
  const hours = Number(hoursStr ?? 0);
  const mins = Number(minsStr ?? 0);
  const totalMinutes = hours * 60 + mins + minutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

function compareWallClock(
  dateStr: string,
  timeStr: string,
  wall: WallClockParts,
): number {
  const dateCompare = wall.dateStr.localeCompare(dateStr);
  if (dateCompare !== 0) return dateCompare;

  return wall.timeStr.localeCompare(timeStr);
}

export function findInstantForWallClock(
  dateStr: string,
  timeStr: string,
  timeZone: string = getAppTimezone(),
): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr ?? "0");
  const month = Number(monthStr ?? "1");
  const day = Number(dayStr ?? "1");

  let low = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - 14 * 60 * 60 * 1000;
  let high = Date.UTC(year, month - 1, day, 23, 59, 59, 999) + 14 * 60 * 60 * 1000;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const wall = getWallClockParts(new Date(mid), timeZone);
    const cmp = compareWallClock(dateStr, timeStr, wall);

    if (cmp < 0) {
      low = mid + 1;
    } else if (cmp > 0) {
      high = mid - 1;
    } else {
      return new Date(mid);
    }
  }

  return new Date(low);
}

export function getDayBoundsInTimezone(
  dateStr: string,
  timeZone: string = getAppTimezone(),
): { start: Date; end: Date } {
  const start = findInstantForWallClock(dateStr, "00:00", timeZone);
  const end = new Date(findInstantForWallClock(dateStr, "23:59", timeZone).getTime() + 59_999);
  return { start, end };
}

export function datesMatchInTimezone(
  left: Date,
  right: Date,
  timeZone: string = getAppTimezone(),
): boolean {
  return getWallClockParts(left, timeZone).dateStr === getWallClockParts(right, timeZone).dateStr;
}

export function getTodayDateStr(timeZone: string = getAppTimezone()): string {
  return getWallClockParts(new Date(), timeZone).dateStr;
}

export function formatAppointmentDateTime(
  date: Date,
  timeZone: string = getAppTimezone(),
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
