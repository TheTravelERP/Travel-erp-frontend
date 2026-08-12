// src/features/settings/branch/components/BranchForm.tsx

import {
  Box,
  Chip,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getBranchSchema } from "../branch.schema";
import type { BranchFormInput } from "../branch.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import MobileNumberField from "../../../../components/common/MobileNumberField";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import { useCodeUniquenessCheck } from "../../../../hooks/useCodeUniquenessCheck";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface BranchFormProps {
  defaultValues?: Partial<BranchFormInput> & { uuid?: string };
  onSubmit: (data: BranchFormInput) => Promise<void>;
  loading?: boolean;
  isHeadOffice?: boolean;
}

const emptyValues: BranchFormInput = {
  branch_code: "",
  branch_name: "",
  legal_name: "",
  localization_profile_uuid: "",
  contact_person_name: "",
  manager_uuid: "",
  office_phone: "",
  emergency_phone: "",
  whatsapp_number: "",
  email: "",
  website: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  latitude: undefined,
  longitude: undefined,
  working_from: "",
  working_to: "",
  remarks: "",
  is_active: true,
};

export default function BranchForm({
  defaultValues,
  onSubmit,
  loading = false,
  isHeadOffice = false,
}: BranchFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const branchSchema = useMemo(() => getBranchSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<BranchFormInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const { onCodeBlur } = useCodeUniquenessCheck<BranchFormInput>({
    entity: "branch",
    fieldName: "branch_code",
    excludeUuid: defaultValues?.uuid,
    setError,
    clearErrors,
    message: t("validation.codeAlreadyExists"),
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
      sx={{ flexGrow: 1 }}
    >
      {isHeadOffice && (
        <Box mb={2}>
          <Chip size="small" color="primary" label={t("branch.headOffice")} />
        </Box>
      )}

      <Grid container spacing={2}>
        <FormSection title={t("branch.sectionGeneral")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="branch_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    onCodeBlur(e.target.value);
                  }}
                  label={t("branch.code")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="branch_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("branch.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="legal_name"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.legalName")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isHeadOffice}
                    />
                  }
                  label={t("common.active")}
                />
              )}
            />
            {isHeadOffice && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {t("branch.headOfficeCannotDeactivate")}
              </Typography>
            )}
          </Grid>
        </FormSection>

        <FormSection title={t("branch.sectionContact")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="contact_person_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("branch.contactPerson")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="manager_uuid"
              label={t("branch.manager")}
              control={control}
              dropdownName="users"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MobileNumberField name="office_phone" control={control} label={t("branch.officePhone")} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MobileNumberField name="emergency_phone" control={control} label={t("branch.emergencyPhone")} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MobileNumberField name="whatsapp_number" control={control} label={t("branch.whatsappNumber")} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.email")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="website"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.website")} fullWidth />}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("common.address")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="address_line1"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.addressLine1")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="address_line2"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.addressLine2")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.city")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="state"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.state")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="country"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.country")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="postal_code"
              control={control}
              render={({ field }) => <TextField {...field} label={t("branch.postalCode")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="latitude"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  type="number"
                  label={t("branch.latitude")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="longitude"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  type="number"
                  label={t("branch.longitude")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="working_from"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="time"
                  label={t("branch.workingFrom")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="working_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="time"
                  label={t("branch.workingTo")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("branch.sectionLocalization")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="localization_profile_uuid"
              label={t("menu.settings.localization_profile")}
              control={control}
              dropdownName="localization_profile"
            />
          </Grid>
        </FormSection>

        <FormSection title={t("branch.sectionOther")}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("branch.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/settings/branch-master")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
