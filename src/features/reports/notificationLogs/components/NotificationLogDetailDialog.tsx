// src/features/reports/notificationLogs/components/NotificationLogDetailDialog.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Divider, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getNotificationLogDetail } from "../notificationLog.api";
import type { NotificationLogDetail } from "../notificationLog.types";
import { statusChipColor } from "./statusChipColor";

interface Props {
  uuid: string | null;
  onClose: () => void;
}

export default function NotificationLogDetailDialog({ uuid, onClose }: Props) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<NotificationLogDetail>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uuid) {
      setDetail(undefined);
      return;
    }
    setLoading(true);
    getNotificationLogDetail(uuid)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [uuid]);

  return (
    <Dialog open={Boolean(uuid)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("notificationLog.detailsTitle")}</DialogTitle>
      <DialogContent dividers>
        {loading || !detail ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">{t("notificationLog.colEvent")}</Typography>
              <Typography fontWeight={600}>{detail.event_code}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">{t("notificationLog.colRecipient")}</Typography>
              <Typography>{detail.recipient_address}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">{t("notificationLog.colChannel")}</Typography>
              <Typography>{detail.channel}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">{t("notificationLog.colProvider")}</Typography>
              <Typography>{detail.provider_name || "—"}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">{t("notificationLog.colStatus")}</Typography>
              <Chip size="small" color={statusChipColor(detail.status)} label={detail.status} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">{t("notificationLog.colRetryCount")}</Typography>
              <Typography>{detail.retry_count}</Typography>
            </Box>
            {detail.error_message && (
              <>
                <Divider />
                <Typography color="error" variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {detail.error_message}
                </Typography>
              </>
            )}
            {detail.provider_response != null && (
              <>
                <Divider />
                <Typography variant="subtitle2">{t("notificationLog.providerResponse")}</Typography>
                <Box
                  component="pre"
                  sx={{ fontSize: 12, bgcolor: "action.hover", p: 1.5, borderRadius: 1, overflow: "auto", maxHeight: 200 }}
                >
                  {JSON.stringify(detail.provider_response, null, 2)}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
