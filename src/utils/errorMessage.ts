// src/utils/errorMessage.ts
import i18n from "../i18n";

/**
 * Safely extract a user-facing string from an Axios/FastAPI error response.
 * FastAPI's `detail` is usually a string, but on a 422 validation error it's an
 * array of Pydantic error objects instead — rendering that directly as a React
 * child (e.g. inside a snackbar message) crashes the app.
 */
export function getErrorMessage(err: any, fallback: string): string {
  // A 401 this late (not the initial "am I logged in?" probe, but an
  // actual submit) almost always means the session expired while the user
  // was filling out a form — FastAPI's own detail ("Not authenticated") is
  // accurate but doesn't tell the user their entries are still on screen,
  // or what to do next. Long forms (a Package quotation with a dozen
  // service lines) are exactly where losing that context hurts most.
  if (err?.response?.status === 401) {
    return i18n.t("common.sessionExpiredKeepData");
  }

  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d?.msg).filter(Boolean).join("; ") || fallback;
  }

  return fallback;
}
