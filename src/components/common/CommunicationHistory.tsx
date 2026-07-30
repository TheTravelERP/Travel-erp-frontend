// src/components/common/CommunicationHistory.tsx
//
// Reusable Communication History + Timeline (Phase 4 — Notification
// Intelligence, Features 4-5). Parameterized by (entityType, entityUuid) so
// it can be dropped onto any entity's view page. Reads only the existing
// notification_log/notification_queue/app_notification tables via
// /api/v1/communication-history — no new history table.
import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ViewListIcon from "@mui/icons-material/ViewList";
import TimelineIcon from "@mui/icons-material/Timeline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";

import { getCommunicationHistory, type CommunicationHistoryItem } from "../../services/communicationHistory.service";
import NotificationLogDetailDialog from "../../features/reports/notificationLogs/components/NotificationLogDetailDialog";
import { statusChipColor } from "../../features/reports/notificationLogs/components/statusChipColor";
import { useLocalizationProfile } from "../../hooks/useLocalizationProfile";
import { createFormatters } from "../../utils/formatters/localization";

interface Props {
  entityType: string;
  entityUuid: string;
}

const CHANNEL_ICON: Record<string, ElementType> = {
  EMAIL: EmailIcon,
  SMS: SmsIcon,
  WHATSAPP: WhatsAppIcon,
  IN_APP: NotificationsIcon,
};

export default function CommunicationHistory({ entityType, entityUuid }: Props) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [view, setView] = useState<"timeline" | "table">("timeline");
  const [rows, setRows] = useState<CommunicationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailUuid, setDetailUuid] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getCommunicationHistory(entityType, entityUuid, 1, 50, controller.signal)
      .then((res) => setRows(res.data))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [entityType, entityUuid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <InboxIcon sx={{ fontSize: 40, opacity: 0.4 }} />
        <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v) => v && setView(v)}
        >
          <ToggleButton value="timeline">
            <TimelineIcon fontSize="small" sx={{ mr: 0.5 }} />
            {t("communicationHistory.timeline")}
          </ToggleButton>
          <ToggleButton value="table">
            <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} />
            {t("communicationHistory.table")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === "timeline" ? (
        <Stack spacing={1.5}>
          {rows.map((row) => {
            const Icon = CHANNEL_ICON[row.channel] ?? NotificationsIcon;
            return (
              <Stack key={row.uuid} direction="row" spacing={1.5} alignItems="flex-start">
                <Icon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" color={statusChipColor(row.status as any)} label={row.status} />
                    <Typography variant="body2" color="text.secondary">
                      {row.channel}
                      {row.provider_name ? ` • ${row.provider_name}` : ""}
                      {row.recipient ? ` • ${row.recipient}` : ""}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" noWrap title={row.message_preview ?? undefined}>
                    {row.message_preview}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(row.occurred_at)}
                  </Typography>
                </Box>
                {row.source === "outbound" && (
                  <Tooltip title={t("communicationHistory.openRelatedLog")}>
                    <IconButton size="small" onClick={() => setDetailUuid(row.uuid)}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("communicationHistory.colDate")}</TableCell>
                <TableCell>{t("communicationHistory.colChannel")}</TableCell>
                <TableCell>{t("communicationHistory.colProvider")}</TableCell>
                <TableCell>{t("communicationHistory.colRecipient")}</TableCell>
                <TableCell>{t("communicationHistory.colStatus")}</TableCell>
                <TableCell>{t("communicationHistory.colTemplate")}</TableCell>
                <TableCell>{t("communicationHistory.colRetryCount")}</TableCell>
                <TableCell align="right">{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.uuid} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(row.occurred_at)}</TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell>{row.provider_name || "-"}</TableCell>
                  <TableCell>{row.recipient || "-"}</TableCell>
                  <TableCell>
                    <Chip size="small" color={statusChipColor(row.status as any)} label={row.status} />
                  </TableCell>
                  <TableCell>{row.template_name || "-"}</TableCell>
                  <TableCell>{row.retry_count}</TableCell>
                  <TableCell align="right">
                    {row.source === "outbound" && (
                      <IconButton size="small" onClick={() => setDetailUuid(row.uuid)}>
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <NotificationLogDetailDialog uuid={detailUuid} onClose={() => setDetailUuid(null)} />
    </Box>
  );
}
