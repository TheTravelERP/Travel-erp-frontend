// src/utils/formatters/date.ts
export function formatDate(
    value?: string | Date,
    locale = "en-IN"
) {
    if (!value) return "-";

    return new Intl.DateTimeFormat(locale).format(new Date(value));
}