// src/features/reports/notificationAnalytics/pages/NotificationAnalyticsPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTranslation } from "react-i18next";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";
import { useSearchParams } from "react-router-dom";
import { getNotificationAnalytics, type NotificationAnalytics } from "../../../../services/notificationAnalytics.service";

// Validated categorical palette (dataviz skill reference instance) — series
// colors are fixed-order, not cycled. Sent/Failed use the reserved status
// pair (good/critical) since they represent a state, not an arbitrary
// category.
const STATUS_GOOD = "#0ca30c";
const STATUS_CRITICAL = "#d03b3b";
const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: "center", height: "100%" }}>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function NotificationAnalyticsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const fromDate = searchParams.get("from_date") || "";
  const toDate = searchParams.get("to_date") || "";
  const moduleGroup = searchParams.get("module_group") || "";
  const channel = searchParams.get("channel") || "";

  const [data, setData] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const updateURL = (params: Record<string, unknown>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getNotificationAnalytics(
      { from_date: fromDate || undefined, to_date: toDate || undefined, module_group: moduleGroup || undefined, channel: channel || undefined },
      controller.signal,
    )
      .then(setData)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [fromDate, toDate, moduleGroup, channel]);

  const channels = data ? Object.keys(data.channel_breakdown) : [];
  const sentByChannel = channels.map((c) => data?.channel_breakdown[c]?.SENT ?? 0);
  const failedByChannel = channels.map((c) => data?.channel_breakdown[c]?.FAILED ?? 0);

  const providerNames = data?.provider_performance.map((p) => p.provider_name) ?? [];
  const providerSuccessRates = data?.provider_performance.map((p) => p.success_rate) ?? [];

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("notificationAnalytics.title")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("notificationAnalytics.title") },
        ]}
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <QuickDateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onChange={(v) => updateURL(v)}
            gridSize={{ xs: 12, md: 3 }}
            size="small"
          />
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("notificationAnalytics.module")}
              value={moduleGroup}
              onChange={(e) => updateURL({ module_group: e.target.value || undefined })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              <MenuItem value="CRM">CRM</MenuItem>
              <MenuItem value="Booking">{t("notificationTemplate.moduleBooking")}</MenuItem>
              <MenuItem value="Finance">{t("notificationTemplate.moduleFinance")}</MenuItem>
              <MenuItem value="System">{t("notificationTemplate.moduleSystem")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {!loading && data && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, md: 2 }}>
              <StatTile label={t("notificationAnalytics.created")} value={data.notifications_created} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <StatTile label={t("notificationAnalytics.sent")} value={data.sent} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <StatTile label={t("notificationAnalytics.failed")} value={data.failed} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <StatTile label={t("notificationAnalytics.deliveryRate")} value={`${data.delivery_rate}%`} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <StatTile label={t("notificationAnalytics.failureRate")} value={`${data.failure_rate}%`} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <StatTile
                label={t("notificationAnalytics.avgDeliveryTime")}
                value={data.avg_delivery_seconds != null ? `${data.avg_delivery_seconds}s` : "-"}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" mb={1}>
                  {t("notificationAnalytics.channelBreakdown")}
                </Typography>
                {channels.length > 0 ? (
                  <BarChart
                    height={280}
                    xAxis={[{ scaleType: "band", data: channels }]}
                    series={[
                      { data: sentByChannel, label: t("notificationLog.colStatus") + ": SENT", color: STATUS_GOOD },
                      { data: failedByChannel, label: t("notificationLog.colStatus") + ": FAILED", color: STATUS_CRITICAL },
                    ]}
                  />
                ) : (
                  <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" mb={1}>
                  {t("notificationAnalytics.providerPerformance")}
                </Typography>
                {providerNames.length > 0 ? (
                  <BarChart
                    height={280}
                    xAxis={[{ scaleType: "band", data: providerNames }]}
                    series={[
                      {
                        data: providerSuccessRates,
                        label: t("notificationAnalytics.successRate"),
                        color: CATEGORICAL[0],
                      },
                    ]}
                  />
                ) : (
                  <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" mb={1}>
                  {t("notificationAnalytics.topEvents")}
                </Typography>
                <List dense>
                  {data.top_events.map((e) => (
                    <ListItem
                      key={e.event_code}
                      secondaryAction={<Chip size="small" label={e.count} />}
                    >
                      <ListItemText primary={e.event_code} />
                    </ListItem>
                  ))}
                  {data.top_events.length === 0 && (
                    <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" mb={1}>
                  {t("notificationAnalytics.topTemplates")}
                </Typography>
                <List dense>
                  {data.top_templates.map((tpl) => (
                    <ListItem
                      key={tpl.template_name}
                      secondaryAction={<Chip size="small" label={tpl.count} />}
                    >
                      <ListItemText primary={tpl.template_name} />
                    </ListItem>
                  ))}
                  {data.top_templates.length === 0 && (
                    <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
