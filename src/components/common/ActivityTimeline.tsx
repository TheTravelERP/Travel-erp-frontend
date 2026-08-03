// src/components/common/ActivityTimeline.tsx
//
// Read-only, per-record "everything that happened to this record" — filters
// the existing audit_log table by (entityType, entityUuid) via
// /api/v1/activity. No new storage; see app/models/audit_log_model.py.
// Parameterized the same way as AttachmentList/NoteList/CommunicationHistory
// so it can be dropped onto any entity's view page.
import { useEffect, useMemo, useState } from "react";
import { Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getActivity, type ActivityItem } from "../../services/activity.service";
import { useLocalizationProfile } from "../../hooks/useLocalizationProfile";
import { createFormatters } from "../../utils/formatters/localization";

interface Props {
  entityType: string;
  entityUuid: string;
}

const ACTION_COLOR: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  RESTORE: "warning",
  CLONE: "info",
  MARK_LOST: "error",
  REOPEN: "warning",
  ASSIGN_AGENT: "info",
  ACCEPT: "success",
  REJECT: "error",
  REVISE: "info",
  CONVERT: "success",
  LINK_CUSTOMER: "info",
  CREATE_AND_LINK_CUSTOMER: "info",
  EXPORT: "default",
};

export default function ActivityTimeline({ entityType, entityUuid }: Props) {
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [rows, setRows] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getActivity(entityType, entityUuid, 1, 20, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setRows(res.data);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [entityType, entityUuid]);

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
              {row.actor_name || row.actor_email || t("common.system")}
            </Typography>
            {row.changed_columns && row.changed_columns.length > 0 && (
              <Typography variant="caption" color="text.secondary" component="div">
                {row.changed_columns.join(", ")}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(row.created_at)}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
