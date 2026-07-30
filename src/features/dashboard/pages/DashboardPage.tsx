// src/features/dashboard/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { usePermission } from "../../../hooks/usePermission";
import { getNotificationAnalytics, type NotificationAnalytics } from "../../../services/notificationAnalytics.service";

import RecentCommunicationWidget from "../widgets/RecentCommunicationWidget";
import RecentNotificationsWidget from "../widgets/RecentNotificationsWidget";
import TopNotificationTypesWidget from "../widgets/TopNotificationTypesWidget";
import ChannelUsageWidget from "../widgets/ChannelUsageWidget";
import ProviderUsageWidget from "../widgets/ProviderUsageWidget";

export default function DashboardPage() {
  const { t } = useTranslation();

  const logsPerm = usePermission("reports.notification_logs");
  const centerPerm = usePermission("notifications.center");
  const analyticsPerm = usePermission("reports.notification_analytics");
  const providerHealthPerm = usePermission("reports.provider_health");

  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);

  useEffect(() => {
    if (!analyticsPerm.can_view) return;
    const controller = new AbortController();
    getNotificationAnalytics({}, controller.signal).then(setAnalytics);
    return () => controller.abort();
  }, [analyticsPerm.can_view]);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t("menu.dashboard")}
      </Typography>

      <Grid container spacing={2}>
        {centerPerm.can_view && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <RecentNotificationsWidget />
          </Grid>
        )}

        {logsPerm.can_view && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <RecentCommunicationWidget title={t("dashboard.recentCommunication")} />
          </Grid>
        )}

        {logsPerm.can_view && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <RecentCommunicationWidget title={t("dashboard.recentFailures")} onlyFailed />
          </Grid>
        )}

        {analyticsPerm.can_view && analytics && (
          <>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TopNotificationTypesWidget events={analytics.top_events} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <ChannelUsageWidget channelBreakdown={analytics.channel_breakdown} />
            </Grid>
          </>
        )}

        {providerHealthPerm.can_view && analytics && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ProviderUsageWidget providers={analytics.provider_performance} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
