// src/utils/formatters/localization.ts
// Mirrors app/utils/localization_format.py exactly (token maps, fallback
// values, and number-grouping algorithms) so frontend display and
// backend/export output never disagree. Every date/time/number rendered
// anywhere in the app must go through these functions — never a hardcoded
// Intl.DateTimeFormat/toLocaleString/toFixed of its own.
import type { EffectiveFormatSettings } from "../../services/localizationFormat.service";

const FALLBACK_DATE_FORMAT = "YYYY-MM-DD";
const FALLBACK_TIME_FORMAT = "24h";

type Profile = EffectiveFormatSettings | null | undefined;

interface DateParts {
  y: number;
  m: number;
  d: number;
  h: number;
  min: number;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// Date-only strings ("YYYY-MM-DD") are parsed manually rather than via
// `new Date()` — the latter treats them as UTC midnight, which can shift a
// calendar date backward/forward a day depending on the browser's local
// timezone. A DOB or valid_from must never shift days based on viewer tz.
function parseParts(value?: string | Date | null): DateParts | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return { y: value.getFullYear(), m: value.getMonth() + 1, d: value.getDate(), h: value.getHours(), min: value.getMinutes() };
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return { y: Number(dateOnly[1]), m: Number(dateOnly[2]), d: Number(dateOnly[3]), h: 0, min: 0 };
  }

  // Bare time-of-day, no date component (e.g. Branch working_from/working_to,
  // serialized by the backend as "HH:MM:SS" or "HH:MM") — `new Date(...)`
  // can't parse these at all (returns Invalid Date), so this must be handled
  // explicitly rather than falling through.
  const timeOnly = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (timeOnly) {
    return { y: 1970, m: 1, d: 1, h: Number(timeOnly[1]), min: Number(timeOnly[2]) };
  }

  const dt = new Date(value);
  if (isNaN(dt.getTime())) return null;
  return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate(), h: dt.getHours(), min: dt.getMinutes() };
}

function applyDatePattern(parts: DateParts, token: string): string {
  const yyyy = String(parts.y);
  const mm = pad2(parts.m);
  const dd = pad2(parts.d);

  switch (token) {
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

function applyTimePattern(parts: DateParts, token: string): string {
  if (token === "12h") {
    const period = parts.h >= 12 ? "PM" : "AM";
    const hour12 = parts.h % 12 === 0 ? 12 : parts.h % 12;
    return `${pad2(hour12)}:${pad2(parts.min)} ${period}`;
  }
  return `${pad2(parts.h)}:${pad2(parts.min)}`;
}

export function formatDate(value: string | Date | null | undefined, profile: Profile): string {
  const parts = parseParts(value);
  if (!parts) return "";
  return applyDatePattern(parts, profile?.date_format || FALLBACK_DATE_FORMAT);
}

export function formatTime(value: string | Date | null | undefined, profile: Profile): string {
  const parts = parseParts(value);
  if (!parts) return "";
  return applyTimePattern(parts, profile?.time_format || FALLBACK_TIME_FORMAT);
}

export function formatDateTime(value: string | Date | null | undefined, profile: Profile): string {
  const parts = parseParts(value);
  if (!parts) return "";
  return `${applyDatePattern(parts, profile?.date_format || FALLBACK_DATE_FORMAT)} ${applyTimePattern(parts, profile?.time_format || FALLBACK_TIME_FORMAT)}`;
}

/**
 * Batch/hot-path variant for tables — resolves the profile's tokens ONCE
 * and returns closures that skip the per-call `profile?.x || fallback`
 * resolution + style branching entirely. A table with N rows x M date/number
 * columns calls these closures N*M times per render; without this, that's
 * N*M repeated fallback-checks and style dispatches for a profile that
 * never changes within the render. Wrap with `useMemo(() => createFormatters(profile), [profile])`
 * so the closures themselves are only rebuilt when the profile changes, not
 * on every render.
 */
export function createFormatters(profile: Profile) {
  const dateToken = profile?.date_format || FALLBACK_DATE_FORMAT;
  const timeToken = profile?.time_format || FALLBACK_TIME_FORMAT;
  const numberStyle = profile?.number_format || "western";
  const defaultDecimalPlaces = profile?.default_decimal_places ?? 2;

  return {
    formatDate: (value: string | Date | null | undefined): string => {
      const parts = parseParts(value);
      return parts ? applyDatePattern(parts, dateToken) : "";
    },
    formatTime: (value: string | Date | null | undefined): string => {
      const parts = parseParts(value);
      return parts ? applyTimePattern(parts, timeToken) : "";
    },
    formatDateTime: (value: string | Date | null | undefined): string => {
      const parts = parseParts(value);
      return parts ? `${applyDatePattern(parts, dateToken)} ${applyTimePattern(parts, timeToken)}` : "";
    },
    formatNumber: (value: number | string | null | undefined, decimalPlaces?: number): string =>
      formatNumberWithStyle(value, numberStyle, decimalPlaces !== undefined ? decimalPlaces : defaultDecimalPlaces),
  };
}

// Groups digits in 3s from the right (western: "1,234,567"; european uses "." as sep).
function groupThousands(intPart: string, sep: string): string {
  const reversed = intPart.split("").reverse().join("");
  const groups: string[] = [];
  for (let i = 0; i < reversed.length; i += 3) {
    groups.push(reversed.slice(i, i + 3));
  }
  return groups.join(sep).split("").reverse().join("");
}

// Indian grouping: last 3 digits, then groups of 2 (e.g. "12,34,56,789").
function groupIndian(intPart: string): string {
  if (intPart.length <= 3) return intPart;
  const last3 = intPart.slice(-3);
  let rest = intPart.slice(0, -3);
  const groups: string[] = [];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) groups.unshift(rest);
  return `${groups.join(",")},${last3}`;
}

function formatNumberWithStyle(
  value: number | string | null | undefined,
  style: string,
  places: number,
): string {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = typeof value === "string" ? Number(value) : value;
  if (isNaN(numericValue)) return "";

  const negative = numericValue < 0;
  const fixed = Math.abs(numericValue).toFixed(places);
  const [intPart, fracPart] = fixed.split(".");

  let grouped: string;
  if (style === "indian") {
    grouped = groupIndian(intPart);
  } else if (style === "european") {
    grouped = groupThousands(intPart, ".");
  } else {
    grouped = groupThousands(intPart, ",");
  }

  const decimalSep = style === "european" ? "," : ".";
  const result = grouped + (places > 0 ? decimalSep + fracPart : "");
  return negative ? `-${result}` : result;
}

export function formatNumber(
  value: number | string | null | undefined,
  profile: Profile,
  decimalPlaces?: number,
): string {
  const style = profile?.number_format || "western";
  const places = decimalPlaces !== undefined ? decimalPlaces : (profile?.default_decimal_places ?? 2);
  return formatNumberWithStyle(value, style, places);
}
