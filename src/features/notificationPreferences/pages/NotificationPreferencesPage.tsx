// src/features/notificationPreferences/pages/NotificationPreferencesPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getMyNotificationPreferences, updateMyNotificationPreferences } from "../notificationPreference.api";
import type { NotificationPreference } from "../notificationPreference.types";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

const DEFAULTS: NotificationPreference = {
  in_app_enabled: true,
  email_enabled: true,
  sms_enabled: false,
  whatsapp_enabled: false,
  working_hours_enabled: false,
  working_hours_start: "09:00",
  working_hours_end: "18:00",
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
  daily_digest_enabled: false,
  weekly_digest_enabled: false,
  low_priority_mute: false,
};

export default function NotificationPreferencesPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [prefs, setPrefs] = useState<NotificationPreference>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyNotificationPreferences()
      .then((data) =>
        setPrefs({
          ...data,
          working_hours_start: data.working_hours_start ?? DEFAULTS.working_hours_start,
          working_hours_end: data.working_hours_end ?? DEFAULTS.working_hours_end,
          quiet_hours_start: data.quiet_hours_start ?? DEFAULTS.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end ?? DEFAULTS.quiet_hours_end,
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof NotificationPreference>(key: K, value: NotificationPreference[K]) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateMyNotificationPreferences(prefs);
      setPrefs(saved);
      showSnackbar({ message: t("notificationPreferences.saved"), severity: "success" });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? t("notificationPreferences.saveFailed"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {t("notificationPreferences.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {t("profile.home")} &bull; {t("profile.profile")} &bull; {t("notificationPreferences.title")}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 640 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t("notificationPreferences.channels")}
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch checked={prefs.in_app_enabled} onChange={(e) => set("in_app_enabled", e.target.checked)} />}
                label={t("notificationPreferences.inApp")}
              />
              <FormControlLabel
                control={<Switch checked={prefs.email_enabled} onChange={(e) => set("email_enabled", e.target.checked)} />}
                label={t("notificationPreferences.email")}
              />
              <FormControlLabel
                control={<Switch checked={prefs.sms_enabled} onChange={(e) => set("sms_enabled", e.target.checked)} />}
                label={t("notificationPreferences.sms")}
              />
              <FormControlLabel
                control={<Switch checked={prefs.whatsapp_enabled} onChange={(e) => set("whatsapp_enabled", e.target.checked)} />}
                label={t("notificationPreferences.whatsapp")}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.working_hours_enabled}
                  onChange={(e) => set("working_hours_enabled", e.target.checked)}
                />
              }
              label={t("notificationPreferences.workingHours")}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              {t("notificationPreferences.workingHoursHelp")}
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                size="small"
                label={t("notificationPreferences.workingHoursStart")}
                disabled={!prefs.working_hours_enabled}
                value={prefs.working_hours_start ?? ""}
                onChange={(e) => set("working_hours_start", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                size="small"
                label={t("notificationPreferences.workingHoursEnd")}
                disabled={!prefs.working_hours_enabled}
                value={prefs.working_hours_end ?? ""}
                onChange={(e) => set("working_hours_end", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.quiet_hours_enabled}
                  onChange={(e) => set("quiet_hours_enabled", e.target.checked)}
                />
              }
              label={t("notificationPreferences.quietHours")}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              {t("notificationPreferences.quietHoursHelp")}
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                type="time"
                size="small"
                label={t("notificationPreferences.quietHoursStart")}
                disabled={!prefs.quiet_hours_enabled}
                value={prefs.quiet_hours_start ?? ""}
                onChange={(e) => set("quiet_hours_start", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                size="small"
                label={t("notificationPreferences.quietHoursEnd")}
                disabled={!prefs.quiet_hours_enabled}
                value={prefs.quiet_hours_end ?? ""}
                onChange={(e) => set("quiet_hours_end", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t("notificationPreferences.digests")}
            </Typography>
            <Stack>
              <FormControlLabel
                control={
                  <Switch checked={prefs.daily_digest_enabled} onChange={(e) => set("daily_digest_enabled", e.target.checked)} />
                }
                label={t("notificationPreferences.dailyDigest")}
              />
              <FormControlLabel
                control={
                  <Switch checked={prefs.weekly_digest_enabled} onChange={(e) => set("weekly_digest_enabled", e.target.checked)} />
                }
                label={t("notificationPreferences.weeklyDigest")}
              />
            </Stack>
          </Box>

          <Divider />

          <FormControlLabel
            control={<Switch checked={prefs.low_priority_mute} onChange={(e) => set("low_priority_mute", e.target.checked)} />}
            label={t("notificationPreferences.lowPriorityMute")}
          />

          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ alignSelf: "flex-start", minWidth: 140 }}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
