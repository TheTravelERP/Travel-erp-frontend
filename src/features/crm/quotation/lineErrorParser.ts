// src/features/crm/quotation/lineErrorParser.ts
//
// Parses the backend's "Tax could not be determined for the following
// line(s)..." 422 detail string (Layers 2-3, quotation_service.py's
// _build_service_lines) into per-line info, so QuotationForm.tsx can show
// the reason inline against the specific blocking line instead of a
// generic toast (Tax & Pricing Architecture layer 4, Task 6).
//
// This is UI-only string parsing of an existing, already-proven error
// format — no backend change. If the backend message shape ever changes,
// this simply stops matching and the caller's existing generic-toast
// fallback takes over (see QuotationCreatePage.tsx/QuotationEditPage.tsx).

export interface LineTaxError {
  lineNo: number;
  serviceType: string;
  label: string;
  reason: string;
}

// Header capture is lazy-but-paren-tolerant (not `[^)]*`) because the
// line's own description can itself contain parentheses (e.g. "Hotel
// (Deluxe Room)") — a `[^)]*` capture would stop at that inner `)` and
// never find the real header-closing `):`, silently failing to match.
const LINE_ERROR_PATTERN = /Line (\d+) \((.+?)\):\s*([^;]+?)(?:;\s*|$)/g;

/** Returns one entry per "Line N (...): reason" segment found, or null if
 *  the message doesn't look like this specific error shape at all (any
 *  other 422/500/network error falls through to the generic toast). */
export function parseLineTaxErrors(message: string | undefined | null): LineTaxError[] | null {
  if (!message || !message.includes("Tax could not be determined")) return null;

  const results: LineTaxError[] = [];
  for (const match of message.matchAll(LINE_ERROR_PATTERN)) {
    const [, lineNoStr, header, reason] = match;
    const lineNo = Number(lineNoStr);
    if (!Number.isFinite(lineNo)) continue;
    // header is "ServiceType — label" (em dash, see quotation_service.py's
    // f"Line {idx} ({line['service_type']} — {label})") — split defensively
    // in case a description itself happens to contain " — ".
    const dashIndex = header.indexOf(" — ");
    const serviceType = dashIndex >= 0 ? header.slice(0, dashIndex).trim() : header.trim();
    const label = dashIndex >= 0 ? header.slice(dashIndex + 3).trim() : "";
    results.push({ lineNo, serviceType, label, reason: reason.trim() });
  }
  return results.length > 0 ? results : null;
}

// Best-effort "fix it" shortcut — keyword-matched against the reason text,
// not a general system (Task 6: "if feasible without overbuilding").
export function suggestFixLink(reason: string): { labelKey: string; href: string } | null {
  if (reason.includes("Airline Master")) {
    return { labelKey: "quotation.fixInAirlineMaster", href: "/app/inventory/airlines" };
  }
  if (reason.includes("Package")) {
    return { labelKey: "quotation.fixInPackageMaster", href: "/app/packages/list" };
  }
  if (reason.includes("Localization Profile")) {
    return { labelKey: "quotation.fixInLocalizationProfile", href: "/app/settings/localization-profiles" };
  }
  return null;
}
