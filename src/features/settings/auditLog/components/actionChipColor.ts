// src/features/settings/auditLog/components/actionChipColor.ts
import type { ChipProps } from "@mui/material";

const COLOR_BY_ACTION: Record<string, ChipProps["color"]> = {
  CREATE: "success",
  RESTORE: "success",
  BULK_RESTORE: "success",
  UPDATE: "info",
  IMPORT: "secondary",
  EXPORT: "default",
  DELETE: "error",
  BULK_DELETE: "error",
};

export function actionChipColor(action: string): ChipProps["color"] {
  return COLOR_BY_ACTION[action] ?? "default";
}
