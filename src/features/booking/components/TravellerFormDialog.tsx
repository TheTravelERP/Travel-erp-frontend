// src/features/booking/components/TravellerFormDialog.tsx
import {
  Accordion, AccordionDetails, AccordionSummary,
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Grid, MenuItem, TextField, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ROOM_TYPE_PREFERENCES, TRAVELLER_STATUSES, TRAVELLER_TYPES,
  type TravellerDetail, type TravellerFormInput,
} from "../traveller.types";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import TravellerDocumentsPanel from "./TravellerDocumentsPanel";
import ActivityTimeline from "../../../components/common/ActivityTimeline";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";

type DialogMode = "create" | "edit" | "view";

interface Props {
  open: boolean;
  traveller?: TravellerDetail | null;
  canEdit: boolean;
  mode?: DialogMode;
  initialExpandedSection?: "documents" | "activity";
  onClose: () => void;
  onSubmit: (data: TravellerFormInput) => Promise<void>;
}

const emptyValues: TravellerFormInput = {
  traveller_type: "Adult",
  title: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "",
  date_of_birth: "",
  nationality: "",
  passport_no: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_issue_country: "",
  passport_place_of_issue: "",
  meal_preference: "",
  seat_preference: "",
  frequent_flyer_number: "",
  wheelchair: false,
  medical_notes: "",
  room_type_preference: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  remarks: "",
  status: "Active",
};

function computeAge(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export default function TravellerFormDialog({ open, traveller, canEdit, mode, initialExpandedSection, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const resolvedMode: DialogMode = mode ?? (traveller ? "edit" : "create");
  const isView = resolvedMode === "view";

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<TravellerFormInput>({
    defaultValues: mergeFormDefaults(emptyValues, traveller ?? undefined),
  });

  useEffect(() => {
    if (open) reset(mergeFormDefaults(emptyValues, traveller ?? undefined));
  }, [open, traveller, reset]);

  const [docsExpanded, setDocsExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setDocsExpanded(initialExpandedSection === "documents");
      setActivityExpanded(initialExpandedSection === "activity");
    }
  }, [open, initialExpandedSection]);

  const dateOfBirth = useWatch({ control, name: "date_of_birth" });
  const age = computeAge(dateOfBirth);

  const dialogTitle = isView
    ? t("common.view")
    : traveller ? t("common.edit") : t("booking.addTraveller");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="traveller_type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t("booking.travellerType")} fullWidth disabled={isView}>
                  {TRAVELLER_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.title")} fullWidth disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3.5 }}>
            <Controller name="first_name" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.firstName")} fullWidth required disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3.5 }}>
            <Controller name="last_name" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.lastName")} fullWidth disabled={isView} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete name="gender" label={t("settings.gender")} control={control} useForm disabled={isView} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="date_of_birth" control={control} render={({ field }) => (
              <TextField {...field} type="date" label={t("booking.dateOfBirth")} fullWidth disabled={isView} slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField label={t("common.age")} value={age ?? "-"} fullWidth disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="nationality" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.nationality")} fullWidth disabled={isView} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="wheelchair" control={control} render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={isView} />}
                label={t("booking.specialAssistance")}
              />
            )} />
          </Grid>
          {traveller && (
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller name="status" control={control} render={({ field }) => (
                <TextField {...field} select label={t("common.status")} fullWidth disabled={isView}>
                  {TRAVELLER_STATUSES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="passport_no" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.passportNo")} fullWidth disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="passport_issue_date" control={control} render={({ field }) => (
              <TextField {...field} type="date" label={t("booking.passportIssueDate")} fullWidth disabled={isView} slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="passport_expiry_date" control={control} render={({ field }) => (
              <TextField {...field} type="date" label={t("booking.passportExpiryDate")} fullWidth disabled={isView} slotProps={{ inputLabel: { shrink: true } }} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="passport_issue_country" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.passportIssueCountry")} fullWidth disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="passport_place_of_issue" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.passportPlaceOfIssue")} fullWidth disabled={isView} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="meal_preference" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.mealPreference")} fullWidth disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="seat_preference" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.seatPreference")} fullWidth disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="frequent_flyer_number" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.frequentFlyerNumber")} fullWidth disabled={isView} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="room_type_preference" control={control} render={({ field }) => (
              <TextField {...field} select label={t("booking.roomTypePreference")} fullWidth disabled={isView}>
                <MenuItem value="">-</MenuItem>
                {ROOM_TYPE_PREFERENCES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="emergency_contact_relationship" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.emergencyContactRelationship")} fullWidth disabled={isView} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="emergency_contact_name" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.emergencyContactName")} fullWidth disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="emergency_contact_phone" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.emergencyContactPhone")} fullWidth disabled={isView} />
            )} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller name="medical_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.medicalNotes")} fullWidth multiline minRows={2} disabled={isView} />
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="remarks" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.remarks")} fullWidth multiline minRows={2} disabled={isView} />
            )} />
          </Grid>
        </Grid>

        {traveller && (
          <>
            <Accordion sx={{ mt: 2 }} expanded={docsExpanded} onChange={() => setDocsExpanded((v) => !v)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{t("common.attachments")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TravellerDocumentsPanel travellerUuid={traveller.uuid} canEdit={canEdit && !isView} />
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mt: 1 }} expanded={activityExpanded} onChange={() => setActivityExpanded((v) => !v)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{t("common.activity")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ActivityTimeline entityType="traveller" entityUuid={traveller.uuid} />
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{isView ? t("common.close") : t("common.cancel")}</Button>
        {!isView && (
          <Button variant="contained" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
            {t("common.save")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
