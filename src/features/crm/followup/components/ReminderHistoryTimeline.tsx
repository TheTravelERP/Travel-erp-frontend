// src/features/crm/followup/components/ReminderHistoryTimeline.tsx
import { useEffect, useMemo, useState } from "react";
import { Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getFollowupHistory } from "../followup.api";
import type { FollowupHistoryItem } from "../followup.types";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";

interface Props {
  uuid: string;
}

const ACTION_COLOR: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  CREATE: "success",
  UPDATE: "info",
  COMPLETE: "success",
  RESCHEDULE: "info",
  SNOOZE: "info",
  ASSIGN: "info",
  CANCEL: "error",
  DELETE: "error",
  RESTORE: "warning",
};

export default function ReminderHistoryTimeline({ uuid }: Props) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [rows, setRows] = useState<FollowupHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFollowupHistory(uuid)
      .then((res) => {
        if (!cancelled) setRows(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t("common.noRecordsFound")}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {rows.map((row) => (
        <Stack key={row.uuid} direction="row" spacing={1.5} alignItems="flex-start">
          <Chip size="small" label={row.action} color={ACTION_COLOR[row.action] ?? "default"} />
          <Box>
            <Typography variant="body2">
              {row.actor_name || row.actor_email || t("followup.historySystem")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(row.created_at)}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
