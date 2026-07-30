// src/features/crm/followup/components/ReminderRescheduleDialog.tsx
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { rescheduleFollowup, snoozeFollowup } from "../followup.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  uuid: string | null;
  onClose: () => void;
  onDone: () => void;
}

/** HTML datetime-local input format ("YYYY-MM-DDTHH:MM") from a Date. */
function toDatetimeLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ReminderRescheduleDialog({ uuid, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [value, setValue] = useState("");
  const [isSnoozePreset, setIsSnoozePreset] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyPreset = (fromNow: (d: Date) => void) => {
    const d = new Date();
    fromNow(d);
    setValue(toDatetimeLocalInput(d));
    setIsSnoozePreset(true);
  };

  const presets = [
    { key: "1h", label: t("followup.snooze1Hour"), apply: () => applyPreset((d) => d.setHours(d.getHours() + 1)) },
    { key: "3h", label: t("followup.snooze3Hours"), apply: () => applyPreset((d) => d.setHours(d.getHours() + 3)) },
    {
      key: "tomorrow",
      label: t("followup.snoozeTomorrowMorning"),
      apply: () =>
        applyPreset((d) => {
          d.setDate(d.getDate() + 1);
          d.setHours(9, 0, 0, 0);
        }),
    },
    { key: "1w", label: t("followup.snooze1Week"), apply: () => applyPreset((d) => d.setDate(d.getDate() + 7)) },
  ];

  const handleClose = () => {
    setValue("");
    setIsSnoozePreset(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!uuid || !value) return;

    setSaving(true);
    try {
      if (isSnoozePreset) {
        await snoozeFollowup(uuid, value);
      } else {
        await rescheduleFollowup(uuid, value);
      }
      showSnackbar({ message: t("followup.rescheduleSuccess"), severity: "success" });
      onDone();
      handleClose();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("followup.rescheduleFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(uuid)} onClose={saving ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("followup.rescheduleOrSnooze")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {presets.map((p) => (
              <Chip key={p.key} label={p.label} onClick={p.apply} variant="outlined" size="small" />
            ))}
          </Stack>

          <TextField
            type="datetime-local"
            label={t("followup.nextFollowupDatetime")}
            fullWidth
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setIsSnoozePreset(false);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !value}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
