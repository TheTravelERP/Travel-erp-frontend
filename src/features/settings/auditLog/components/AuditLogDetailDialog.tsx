// src/features/settings/auditLog/components/AuditLogDetailDialog.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

import { getAuditLogDetail } from "../auditLog.api";
import type { AuditLogDetail } from "../auditLog.types";
import { actionChipColor } from "./actionChipColor";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDateTime } from "../../../../utils/formatters/localization";

interface Props {
  uuid: string | null;
  onClose: () => void;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function AuditLogDetailDialog({ uuid, onClose }: Props) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const [detail, setDetail] = useState<AuditLogDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uuid) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getAuditLogDetail(uuid)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uuid]);

  const before = detail?.before_data ?? {};
  const after = detail?.after_data ?? {};
  const changedSet = new Set(detail?.changed_columns ?? []);
  const fieldNames = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();

  return (
    <Dialog open={Boolean(uuid)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("auditLog.detailsTitle")}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && detail && (
          <>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 2 }}>
              <Chip size="small" label={detail.entity_type} />
              <Chip size="small" color={actionChipColor(detail.action)} label={detail.action} />
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(detail.created_at, localizationProfile)}
              </Typography>
            </Stack>

            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{t("auditLog.colActor")}:</strong>{" "}
                {detail.actor_name || detail.actor_email || t("auditLog.systemActor")}
              </Typography>
              {detail.ip_address && (
                <Typography variant="body2">
                  <strong>{t("auditLog.ipAddress")}:</strong> {detail.ip_address}
                </Typography>
              )}
              {detail.user_agent && (
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  <strong>{t("auditLog.userAgent")}:</strong> {detail.user_agent}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {fieldNames.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("auditLog.noChanges")}
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("auditLog.field")}</TableCell>
                      <TableCell>{t("auditLog.before")}</TableCell>
                      <TableCell>{t("auditLog.after")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fieldNames.map((field) => (
                      <TableRow
                        key={field}
                        sx={changedSet.has(field) ? { bgcolor: "warning.light" } : undefined}
                      >
                        <TableCell sx={{ fontFamily: "monospace", whiteSpace: "nowrap" }}>
                          {field}
                        </TableCell>
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {formatCellValue(before[field])}
                        </TableCell>
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {formatCellValue(after[field])}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
