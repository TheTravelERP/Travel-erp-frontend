// src/features/dashboard/widgets/ProviderUsageWidget.tsx
import { Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import DashboardWidgetCard from "../../../components/common/DashboardWidgetCard";
import type { ProviderPerformanceItem } from "../../../services/notificationAnalytics.service";

export default function ProviderUsageWidget({ providers }: { providers: ProviderPerformanceItem[] }) {
  const { t } = useTranslation();

  return (
    <DashboardWidgetCard title={t("dashboard.providerUsage")} viewAllHref="/app/reports/provider-health" viewAllLabel={t("common.viewAll")}>
      {providers.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          {t("common.noRecordsFound")}
        </Typography>
      ) : (
        <List dense disablePadding>
          {providers.slice(0, 5).map((p) => (
            <ListItem
              key={p.provider_name}
              disableGutters
              secondaryAction={<Chip size="small" color={p.success_rate >= 80 ? "success" : "warning"} label={`${p.success_rate}%`} />}
            >
              <ListItemText primary={p.provider_name} secondary={`${p.sent} sent • ${p.failed} failed`} />
            </ListItem>
          ))}
        </List>
      )}
    </DashboardWidgetCard>
  );
}
