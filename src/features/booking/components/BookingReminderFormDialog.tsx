// src/features/booking/components/BookingReminderFormDialog.tsx
import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BookingReminderDetail, BookingReminderFormInput } from "../bookingReminder.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";

interface Props {
  open: boolean;
  reminder?: BookingReminderDetail | null;
  onClose: () => void;
  onSubmit: (data: BookingReminderFormInput) => Promise<void>;
}

const emptyValues: BookingReminderFormInput = {
  assigned_user_uuid: "",
  followup_type: "",
  followup_datetime: new Date().toISOString().slice(0, 16),
  next_followup_datetime: "",
  discussion_notes: "",
  priority: "",
  status: "Pending",
  outcome: "",
};

/** The API returns full ISO datetimes ("...T10:00:00Z"), but an HTML
 * datetime-local input only accepts "YYYY-MM-DDTHH:MM" — a trailing
 * seconds/timezone segment makes the browser treat the value as invalid
 * and render the field blank. */
function toDatetimeLocal(value?: string | null): string | undefined {
  if (!value) return value ?? undefined;
  return value.slice(0, 16);
}

function normalizeDefaults(reminder?: BookingReminderDetail | null) {
  if (!reminder) return undefined;
  return {
    ...reminder,
    followup_datetime: toDatetimeLocal(reminder.followup_datetime),
    next_followup_datetime: toDatetimeLocal(reminder.next_followup_datetime),
  };
}

export default function BookingReminderFormDialog({ open, reminder, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<BookingReminderFormInput>({
    defaultValues: mergeFormDefaults(emptyValues, normalizeDefaults(reminder)),
  });

  useEffect(() => {
    if (open) reset(mergeFormDefaults(emptyValues, normalizeDefaults(reminder)));
  }, [open, reminder, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{reminder ? t("common.edit") : t("booking.addReminder")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete name="followup_type" label={t("booking.reminderType")} control={control} useForm dropdownName="followup_type" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete name="priority" label={t("followup.priority", { defaultValue: "Priority" })} control={control} useForm dropdownName="followup_priority" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete name="assigned_user_uuid" label={t("booking.assignedTo")} control={control} dropdownName="users" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="followup_datetime" control={control} render={({ field }) => (
              <TextField {...field} type="datetime-local" label={t("booking.reminderDatetime")} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="next_followup_datetime" control={control} render={({ field }) => (
              <TextField {...field} type="datetime-local" label={t("booking.nextReminderDatetime")} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          {reminder && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <DropdownAutocomplete name="status" label={t("common.status")} control={control} useForm dropdownName="followup_status" />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Controller name="discussion_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.notes")} fullWidth multiline minRows={2} required />
            )} />
          </Grid>
          {reminder && (
            <Grid size={{ xs: 12 }}>
              <DropdownAutocomplete name="outcome" label={t("followup.outcome", { defaultValue: "Outcome" })} control={control} useForm dropdownName="followup_outcome" />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit(async (data) => {
            await onSubmit(data);
            reset(emptyValues);
          })}
        >
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
