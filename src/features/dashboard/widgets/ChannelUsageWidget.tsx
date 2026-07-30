// src/features/dashboard/widgets/ChannelUsageWidget.tsx
import { BarChart } from "@mui/x-charts/BarChart";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import DashboardWidgetCard from "../../../components/common/DashboardWidgetCard";

const STATUS_GOOD = "#0ca30c";
const STATUS_CRITICAL = "#d03b3b";

interface Props {
  channelBreakdown: Record<string, Record<string, number>>;
}

export default function ChannelUsageWidget({ channelBreakdown }: Props) {
  const { t } = useTranslation();
  const channels = Object.keys(channelBreakdown);

  if (channels.length === 0) {
    return (
      <DashboardWidgetCard title={t("dashboard.channelUsage")}>
        <Typography color="text.secondary" variant="body2">
          {t("common.noRecordsFound")}
        </Typography>
      </DashboardWidgetCard>
    );
  }

  return (
    <DashboardWidgetCard title={t("dashboard.channelUsage")} viewAllHref="/app/reports/notification-analytics" viewAllLabel={t("common.viewAll")}>
      <BarChart
        height={220}
        xAxis={[{ scaleType: "band", data: channels }]}
        series={[
          { data: channels.map((c) => channelBreakdown[c]?.SENT ?? 0), label: "SENT", color: STATUS_GOOD },
          { data: channels.map((c) => channelBreakdown[c]?.FAILED ?? 0), label: "FAILED", color: STATUS_CRITICAL },
        ]}
      />
    </DashboardWidgetCard>
  );
}
