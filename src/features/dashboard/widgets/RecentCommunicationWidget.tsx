// src/features/dashboard/widgets/RecentCommunicationWidget.tsx
import { useEffect, useMemo, useState } from "react";
import { List, ListItem, ListItemText, Chip, Typography, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import DashboardWidgetCard from "../../../components/common/DashboardWidgetCard";
import { getNotificationLogs } from "../../reports/notificationLogs/notificationLog.api";
import type { NotificationLogListItem } from "../../reports/notificationLogs/notificationLog.types";
import { statusChipColor } from "../../reports/notificationLogs/components/statusChipColor";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

interface Props {
  onlyFailed?: boolean;
  title: string;
}

export default function RecentCommunicationWidget({ onlyFailed, title }: Props) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [rows, setRows] = useState<NotificationLogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getNotificationLogs(
      { page: 1, page_size: 5, status: onlyFailed ? "FAILED" : undefined },
      controller.signal,
    )
      .then((res) => setRows(res.data))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [onlyFailed]);

  return (
    <DashboardWidgetCard title={title} viewAllHref="/app/reports/notification-logs" viewAllLabel={t("common.viewAll")}>
      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          {t("common.noRecordsFound")}
        </Typography>
      ) : (
        <List dense disablePadding>
          {rows.map((row) => (
            <ListItem key={row.uuid} disableGutters secondaryAction={<Chip size="small" color={statusChipColor(row.status)} label={row.status} />}>
              <ListItemText
                primary={row.event_code}
                secondary={`${row.channel} • ${row.recipient_address} • ${formatDateTime(row.created_at)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  );
}
