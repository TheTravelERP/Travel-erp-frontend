// src/features/dashboard/widgets/TopNotificationTypesWidget.tsx
import { Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import DashboardWidgetCard from "../../../components/common/DashboardWidgetCard";
import type { TopEventItem } from "../../../services/notificationAnalytics.service";

export default function TopNotificationTypesWidget({ events }: { events: TopEventItem[] }) {
  const { t } = useTranslation();

  return (
    <DashboardWidgetCard title={t("dashboard.topNotificationTypes")} viewAllHref="/app/reports/notification-analytics" viewAllLabel={t("common.viewAll")}>
      {events.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          {t("common.noRecordsFound")}
        </Typography>
      ) : (
        <List dense disablePadding>
          {events.slice(0, 5).map((e) => (
            <ListItem key={e.event_code} disableGutters secondaryAction={<Chip size="small" label={e.count} />}>
              <ListItemText primary={e.event_code} />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  );
}
