// src/utils/errorMessage.ts

/**
 * Safely extract a user-facing string from an Axios/FastAPI error response.
 * FastAPI's `detail` is usually a string, but on a 422 validation error it's an
 * array of Pydantic error objects instead — rendering that directly as a React
 * child (e.g. inside a snackbar message) crashes the app.
 */
export function getErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d?.msg).filter(Boolean).join("; ") || fallback;
  }

  return fallback;
}
