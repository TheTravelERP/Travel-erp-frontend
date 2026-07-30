// src/features/dashboard/widgets/RecentNotificationsWidget.tsx
import { useEffect, useMemo, useState } from "react";
import { List, ListItem, ListItemText, Typography, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import DashboardWidgetCard from "../../../components/common/DashboardWidgetCard";
import { getNotifications } from "../../notifications/notification.api";
import type { NotificationListItem } from "../../notifications/notification.types";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

export default function RecentNotificationsWidget() {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [rows, setRows] = useState<NotificationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getNotifications({ page: 1, page_size: 5 }, controller.signal)
      .then((res) => setRows(res.data))
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <DashboardWidgetCard title={t("dashboard.recentNotifications")} viewAllHref="/app/notifications" viewAllLabel={t("common.viewAll")}>
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
            <ListItem key={row.uuid} disableGutters>
              <ListItemText
                primary={row.title}
                secondary={formatDateTime(row.created_at)}
                primaryTypographyProps={{ fontWeight: row.is_read ? 400 : 700 }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  );
}
