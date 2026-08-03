// src/features/booking/components/BookingReminderFormDialog.tsx
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BookingReminderFormInput } from "../bookingReminder.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";

interface Props {
  open: boolean;
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
};

export default function BookingReminderFormDialog({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<BookingReminderFormInput>({
    defaultValues: emptyValues,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("booking.addReminder")}</DialogTitle>
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
          <Grid size={{ xs: 12 }}>
            <Controller name="discussion_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.notes")} fullWidth multiline minRows={2} required />
            )} />
          </Grid>
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
