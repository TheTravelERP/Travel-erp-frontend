// src/features/reports/providerHealth/pages/ProviderHealthPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";
import { getProviderHealth, type ProviderHealthItem } from "../../../../services/notificationAnalytics.service";

// Reserved status palette (dataviz skill) — never used for arbitrary
// series, always icon/label + color together.
const STATUS_COLOR: Record<string, "success" | "warning" | "error"> = {
  HEALTHY: "success",
  WARNING: "warning",
  OFFLINE: "error",
};

export default function ProviderHealthPage() {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = createFormatters(localizationProfile);

  const [providers, setProviders] = useState<ProviderHealthItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getProviderHealth(controller.signal)
      .then(setProviders)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("providerHealth.title")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("providerHealth.title") },
        ]}
      />

      {!loading && (
        <Grid container spacing={2}>
          {providers.map((p) => (
            <Grid key={p.uuid} size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography variant="h6">{p.provider_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.provider_category} • {p.provider_type}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={STATUS_COLOR[p.status]}
                    label={t(`providerHealth.status${p.status}`)}
                  />
                </Stack>

                <Stack spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{t("providerHealth.successRate")}</Typography>
                    <Typography variant="body2">{p.success_rate != null ? `${p.success_rate}%` : "-"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{t("providerHealth.failureRate")}</Typography>
                    <Typography variant="body2">{p.failure_rate != null ? `${p.failure_rate}%` : "-"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{t("providerHealth.avgResponseTime")}</Typography>
                    <Typography variant="body2">
                      {p.avg_response_seconds != null ? `${p.avg_response_seconds}s` : "-"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{t("providerHealth.lastSuccess")}</Typography>
                    <Typography variant="body2">{p.last_success ? formatDateTime(p.last_success) : "-"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">{t("providerHealth.lastFailure")}</Typography>
                    <Typography variant="body2">{p.last_failure ? formatDateTime(p.last_failure) : "-"}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))}

          {providers.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" textAlign="center" py={4}>
                {t("common.noRecordsFound")}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
