// src/features/settings/taxRegistration/components/TaxRegistrationForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getTaxRegistrationSchema } from "../taxRegistration.schema";
import type { TaxRegistrationFormInput } from "../taxRegistration.types";
import CountryAutocomplete from "../../../../components/common/CountryAutocomplete";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface TaxRegistrationFormProps {
  defaultValues?: Partial<TaxRegistrationFormInput>;
  onSubmit: (data: TaxRegistrationFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: TaxRegistrationFormInput = {
  label: "",
  registration_number: "",
  country: "",
  localization_profile_uuid: "",
  is_active: true,
};

export default function TaxRegistrationForm({
  defaultValues,
  onSubmit,
  loading = false,
}: TaxRegistrationFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const taxRegistrationSchema = useMemo(() => getTaxRegistrationSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<TaxRegistrationFormInput>({
    resolver: zodResolver(taxRegistrationSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("menu.settings.tax_registration")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <EntityAutocomplete
              name="localization_profile_uuid"
              label={t("menu.settings.localization_profile")}
              control={control}
              dropdownName="localization_profile"
              setValue={setValue}
              autoFillMap={{ label: "registration_label" }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="label"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("taxRegistration.label")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="registration_number"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("taxRegistration.registrationNumber")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CountryAutocomplete
              name="country"
              label={t("common.country")}
              field="label"
              control={control}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("common.active")}
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/settings/tax-registration")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
