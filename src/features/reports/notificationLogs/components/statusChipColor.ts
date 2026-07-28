// src/features/reports/notificationLogs/components/statusChipColor.ts
import type { NotificationLogStatus } from "../notificationLog.types";

export function statusChipColor(status: NotificationLogStatus): "success" | "error" | "warning" | "default" | "info" {
  switch (status) {
    case "SENT":
      return "success";
    case "FAILED":
      return "error";
    case "RETRY":
    case "PROCESSING":
      return "warning";
    case "PENDING":
      return "info";
    default:
      return "default";
  }
}
