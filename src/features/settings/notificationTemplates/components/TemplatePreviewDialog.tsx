// src/features/settings/notificationTemplates/components/TemplatePreviewDialog.tsx

import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { previewNotificationTemplate } from "../notificationTemplate.api";
import type { NotificationChannel } from "../notificationTemplate.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  open: boolean;
  channel: NotificationChannel;
  subject?: string;
  messageBody: string;
  onClose: () => void;
}

export default function TemplatePreviewDialog({ open, channel, subject, messageBody, onClose }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject?: string; message_body: string }>();

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await previewNotificationTemplate({ channel, subject, message_body: messageBody });
        setResult(res);
      } catch (err: any) {
        showSnackbar({ message: getErrorMessage(err, t("notificationTemplate.previewFailed")), severity: "error" });
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("notificationTemplate.preview")}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          result && (
            <Box>
              {channel === "EMAIL" && result.subject && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("notificationTemplate.subject")}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {result.subject}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t("notificationTemplate.messageBody")}
              </Typography>
              {channel === "EMAIL" ? (
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }} dangerouslySetInnerHTML={{ __html: result.message_body }} />
              ) : (
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, whiteSpace: "pre-wrap" }}>
                  {result.message_body}
                </Box>
              )}
            </Box>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
