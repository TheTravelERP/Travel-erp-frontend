// src/features/reports/travelers/components/passportStatusChipColor.ts
import type { PassportStatus } from "../travelerReport.types";

export function passportStatusChipColor(status?: string | null): "success" | "error" | "warning" | "default" {
  switch (status as PassportStatus) {
    case "Valid":
      return "success";
    case "Expiring Soon":
      return "warning";
    case "Expired":
      return "error";
    default:
      // "Missing" and "Unknown" are neutral/incomplete-data states, not
      // active problems the way "Expired" is — no need to alarm.
      return "default";
  }
}
