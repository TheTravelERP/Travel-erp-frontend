// src/utils/dateRangePresets.ts

export interface DateRange {
  from: string; // "YYYY-MM-DD", local calendar day
  to: string; // "YYYY-MM-DD", local calendar day
}

export type DateRangePresetValue =
  | "custom"
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "this_financial_year";

export interface DateRangePreset {
  value: DateRangePresetValue;
  labelKey: string;
  /** null for "custom" — it never auto-fills the date fields. */
  compute: ((fyStartMonth: number, today?: Date) => DateRange) | null;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Monday-start; no org "first day of week" setting exists yet — revisit if one is added.
function startOfWeekMonday(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday);
}

function endOfWeekMonday(d: Date): Date {
  const start = startOfWeekMonday(d);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31);
}

/**
 * fyStartMonth is 1-12 (1=Jan...12=Dec), from Organization.financial_year_start_month.
 * If today's month >= fyStartMonth, the FY started this calendar year and ends
 * fyStartMonth-1 next year. Otherwise it started last calendar year.
 * fyStartMonth === 1 degenerates correctly to a plain calendar year.
 */
function financialYearRange(d: Date, fyStartMonth: number): DateRange {
  const month = d.getMonth() + 1; // 1-12
  const startYear = month >= fyStartMonth ? d.getFullYear() : d.getFullYear() - 1;
  const start = new Date(startYear, fyStartMonth - 1, 1);
  const end = new Date(startYear + 1, fyStartMonth - 1, 0); // day 0 = last day of prev month
  return { from: toISODate(start), to: toISODate(end) };
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { value: "custom", labelKey: "common.custom", compute: null },
  {
    value: "today",
    labelKey: "common.today",
    compute: (_fyStartMonth, today = new Date()) => {
      const s = toISODate(today);
      return { from: s, to: s };
    },
  },
  {
    value: "this_week",
    labelKey: "common.thisWeek",
    compute: (_fyStartMonth, today = new Date()) => ({
      from: toISODate(startOfWeekMonday(today)),
      to: toISODate(endOfWeekMonday(today)),
    }),
  },
  {
    value: "this_month",
    labelKey: "common.thisMonth",
    compute: (_fyStartMonth, today = new Date()) => ({
      from: toISODate(startOfMonth(today)),
      to: toISODate(endOfMonth(today)),
    }),
  },
  {
    value: "this_year",
    labelKey: "common.thisYear",
    compute: (_fyStartMonth, today = new Date()) => ({
      from: toISODate(startOfYear(today)),
      to: toISODate(endOfYear(today)),
    }),
  },
  {
    value: "this_financial_year",
    labelKey: "common.thisFinancialYear",
    compute: (fyStartMonth, today = new Date()) => financialYearRange(today, fyStartMonth),
  },
];

export function getPresetByValue(value: string): DateRangePreset | undefined {
  return DATE_RANGE_PRESETS.find((p) => p.value === value);
}
