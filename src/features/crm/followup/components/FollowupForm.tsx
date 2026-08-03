// src/features/crm/followup/components/FollowupForm.tsx

import { Box, Grid, TextField } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getFollowupSchema } from "../followup.schema";
import type { FollowupFormInput } from "../followup.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface FollowupFormProps {
  defaultValues?: Partial<FollowupFormInput>;
  onSubmit: (data: FollowupFormInput) => Promise<void>;
  loading?: boolean;
  /** When set (opened from an Enquiry's own context — the Enquiry tab, or a
   * deep link carrying ?enquiry_uuid=), the Enquiry picker is pre-filled and
   * locked so the user is never asked to pick it again. */
  lockedEnquiryUuid?: string;
  backTo?: string;
}

/** The API returns full ISO datetimes ("...T10:00:00Z"), but an HTML
 * datetime-local input only accepts "YYYY-MM-DDTHH:MM" — a trailing
 * seconds/timezone segment makes the browser treat the value as invalid
 * and render the field blank. */
function toDatetimeLocal(value?: string | null): string | undefined {
  if (!value) return value ?? undefined;
  return value.slice(0, 16);
}

function normalizeDefaults(values?: Partial<FollowupFormInput>): Partial<FollowupFormInput> | undefined {
  if (!values) return values;
  return {
    ...values,
    followup_datetime: toDatetimeLocal(values.followup_datetime),
    next_followup_datetime: toDatetimeLocal(values.next_followup_datetime),
  };
}

const emptyValues: FollowupFormInput = {
  enquiry_uuid: "",
  assigned_user_uuid: "",
  followup_type: "",
  followup_datetime: "",
  next_followup_datetime: "",
  discussion_notes: "",
  outcome: "",
  status: "Pending",
  priority: "",
};

export default function FollowupForm({
  defaultValues,
  onSubmit,
  loading = false,
  lockedEnquiryUuid,
  backTo = "/app/crm/followups",
}: FollowupFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const followupSchema = useMemo(() => getFollowupSchema(t), [t]);

  const mergedDefaults = mergeFormDefaults(
    emptyValues,
    normalizeDefaults(lockedEnquiryUuid ? { ...defaultValues, enquiry_uuid: lockedEnquiryUuid } : defaultValues),
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FollowupFormInput>({
    resolver: zodResolver(followupSchema),
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    reset(
      mergeFormDefaults(
        emptyValues,
        normalizeDefaults(lockedEnquiryUuid ? { ...defaultValues, enquiry_uuid: lockedEnquiryUuid } : defaultValues),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, lockedEnquiryUuid, reset]);

  const followupDatetime = useWatch({ control, name: "followup_datetime" });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("followup.title")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="enquiry_uuid"
              label={t("followup.enquiry")}
              control={control}
              dropdownName="enquiries"
              disabled={!!lockedEnquiryUuid}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="assigned_user_uuid"
              label={t("followup.assignedUser")}
              control={control}
              dropdownName="users"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="followup_type"
              dropdownName="followup_type"
              label={t("followup.type")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="priority"
              dropdownName="followup_priority"
              label={t("followup.priority")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="status"
              dropdownName="followup_status"
              label={t("followup.status")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="followup_datetime"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label={t("followup.followupDatetime")}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="next_followup_datetime"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label={t("followup.nextFollowupDatetime")}
                  fullWidth
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: followupDatetime || undefined },
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || t("followup.nextFollowupHint")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete
              name="outcome"
              dropdownName="followup_outcome"
              label={t("followup.outcome")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="discussion_notes"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("followup.discussionNotes")}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate(backTo)}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
