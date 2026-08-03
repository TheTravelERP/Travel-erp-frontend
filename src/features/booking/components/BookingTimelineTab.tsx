// src/features/booking/components/BookingTimelineTab.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getBookingTimeline, type BookingTimelineItem } from "../booking.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

interface Props {
  bookingUuid: string;
  refreshKey?: number;
}

export default function BookingTimelineTab({ bookingUuid, refreshKey }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = createFormatters(localizationProfile);

  const [rows, setRows] = useState<BookingTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBookingTimeline(bookingUuid)
      .then((data) => { if (active) setRows(data); })
      .catch(() => showSnackbar({ message: t("common.loadFailed"), severity: "error" }))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingUuid, refreshKey]);

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>;
  }

  if (rows.length === 0) {
    return <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>{t("common.noRecordsFound")}</Typography>;
  }

  return (
    <Stack spacing={2}>
      {rows.map((row) => (
        <Box key={row.uuid} sx={{ borderLeft: 3, borderColor: "primary.main", pl: 2 }}>
          <Typography variant="subtitle2">{row.event_type}</Typography>
          {row.event_description && (
            <Typography variant="body2" color="text.secondary">{row.event_description}</Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(row.event_at)}{row.actor_name ? ` • ${row.actor_name}` : ""}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
