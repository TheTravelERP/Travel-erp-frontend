// src/features/booking/components/TravellerSummaryCards.tsx
import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { TravellerDetail } from "../traveller.types";

interface Props {
  travellers: TravellerDetail[];
  loading: boolean;
}

function computeTravellerStats(travellers: TravellerDetail[]) {
  const total = travellers.length;
  let adults = 0, children = 0, infants = 0, passportMissing = 0, visaPending = 0;
  let passportComplete = 0, visaComplete = 0;

  for (const t of travellers) {
    if (t.traveller_type === "Adult") adults += 1;
    else if (t.traveller_type === "Child") children += 1;
    else if (t.traveller_type === "Infant") infants += 1;

    if (t.passport_no) passportComplete += 1; else passportMissing += 1;
    if (t.visa_status === "Approved") visaComplete += 1;
    if (!t.visa_status || t.visa_status === "Pending") visaPending += 1;
  }

  return { total, adults, children, infants, passportMissing, visaPending, passportComplete, visaComplete };
}

function StatTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
      <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={700} color={color}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Paper>
    </Grid>
  );
}

export default function TravellerSummaryCards({ travellers, loading }: Props) {
  const { t } = useTranslation();

  if (loading) return null;

  const stats = computeTravellerStats(travellers);
  const passportPct = stats.total ? Math.round((stats.passportComplete / stats.total) * 100) : 0;
  const visaPct = stats.total ? Math.round((stats.visaComplete / stats.total) * 100) : 0;
  const overallComplete = Math.min(stats.passportComplete, stats.visaComplete);
  const overallPct = stats.total ? Math.round((overallComplete / stats.total) * 100) : 0;

  return (
    <Box mb={2}>
      <Grid container spacing={1.5} mb={2}>
        <StatTile label={t("booking.totalTravellers", "Total Travellers")} value={stats.total} />
        <StatTile label={t("booking.paxAdult")} value={stats.adults} />
        <StatTile label={t("booking.paxChild")} value={stats.children} />
        <StatTile label={t("booking.paxInfant")} value={stats.infants} />
        <StatTile label={t("booking.passportMissing", "Passport Missing")} value={stats.passportMissing} color={stats.passportMissing > 0 ? "warning.main" : undefined} />
        <StatTile label={t("booking.visaPending", "Visa Pending")} value={stats.visaPending} color={stats.visaPending > 0 ? "warning.main" : undefined} />
      </Grid>

      {stats.total > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="subtitle2" fontWeight={600}>{t("booking.travellerCompletion", "Traveller Completion")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("booking.completionFraction", "{{done}} / {{total}} Complete", { done: overallComplete, total: stats.total })}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={overallPct} sx={{ mb: 1.5, height: 6, borderRadius: 3 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{t("booking.passportNo", "Passport")}</Typography>
                <Typography variant="caption" color="text.secondary">{stats.passportComplete} / {stats.total}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={passportPct} sx={{ height: 4, borderRadius: 2 }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{t("booking.visaStatus", "Visa")}</Typography>
                <Typography variant="caption" color="text.secondary">{stats.visaComplete} / {stats.total}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={visaPct} sx={{ height: 4, borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
