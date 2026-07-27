// src/features/settings/localizationProfile/components/LocalizationProfileForm.tsx

import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { getLocalizationProfileSchema } from "../localizationProfile.schema";
import type { LocalizationProfileFormInput } from "../localizationProfile.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface LocalizationProfileFormProps {
  defaultValues?: Partial<LocalizationProfileFormInput>;
  onSubmit: (data: LocalizationProfileFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: LocalizationProfileFormInput = {
  profile_name: "",
  country_code: "",
  default_currency_code: "",
  timezone: "",
  financial_year_start_month: 1,
  date_format: "YYYY-MM-DD",
  time_format: "24h",
  number_format: "western",
  registration_label: "",
  tax_calculation_method: "exclusive",
  round_off_method: "nearest",
  default_decimal_places: 2,
  is_active: true,
  tax_components: [],
};

export default function LocalizationProfileForm({
  defaultValues,
  onSubmit,
  loading = false,
}: LocalizationProfileFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const localizationProfileSchema = useMemo(() => getLocalizationProfileSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<LocalizationProfileFormInput>({
    resolver: zodResolver(localizationProfileSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tax_components" });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const taxComponentsError =
    errors.tax_components && !Array.isArray(errors.tax_components)
      ? (errors.tax_components as any)?.message
      : undefined;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("localizationProfile.sectionGeneral")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="profile_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("localizationProfile.profileName")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="country_code"
              label={t("common.country")}
              control={control}
              dropdownName="country"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="default_currency_code"
              label={t("localizationProfile.defaultCurrency")}
              control={control}
              dropdownName="currency_master"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="timezone"
              label={t("settings.timezone")}
              control={control}
              useForm
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="financial_year_start_month"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  SelectProps={{ native: true }}
                  label={t("localizationProfile.financialYearStartMonth")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {t(`common.months.${m}`, { defaultValue: String(m) })}
                    </option>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="registration_label"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("settings.registrationLabel")}
                  placeholder={t("settings.registrationLabelPlaceholder")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="date_format"
              label={t("settings.dateFormat")}
              control={control}
              useForm
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="time_format"
              label={t("settings.timeFormat")}
              control={control}
              useForm
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="number_format"
              label={t("localizationProfile.numberFormat")}
              control={control}
              useForm
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="default_decimal_places"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("localizationProfile.defaultDecimalPlaces")}
                  fullWidth
                  inputProps={{ min: 0, max: 6 }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="tax_calculation_method"
              label={t("localizationProfile.taxCalculationMethod")}
              control={control}
              useForm
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="round_off_method"
              label={t("localizationProfile.roundOffMethod")}
              control={control}
              useForm
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

        <FormSection
          title={t("localizationProfile.taxComponents")}
          titleAdornment={
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({ tax_name: "", tax_percent: "", tax_type: "", sequence: fields.length })}
              sx={{ ml: 2 }}
            >
              {t("localizationProfile.addTaxComponent")}
            </Button>
          }
        >
          {taxComponentsError && (
            <Grid size={{ xs: 12 }}>
              <Typography color="error" variant="body2">
                {taxComponentsError}
              </Typography>
            </Grid>
          )}

          {fields.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                {t("localizationProfile.noTaxComponentsYet")}
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Grid container spacing={2} key={field.id} alignItems="center">
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Controller
                      name={`tax_components.${index}.tax_name`}
                      control={control}
                      render={({ field: f, fieldState }) => (
                        <TextField
                          {...f}
                          label={t("localizationProfile.taxName")}
                          fullWidth
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Controller
                      name={`tax_components.${index}.tax_percent`}
                      control={control}
                      render={({ field: f, fieldState }) => (
                        <TextField
                          {...f}
                          type="number"
                          label={t("localizationProfile.taxPercent")}
                          fullWidth
                          required
                          inputProps={{ step: "0.001", min: 0 }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <DropdownAutocomplete
                      name={`tax_components.${index}.tax_type`}
                      dropdownName="tax_type"
                      label={t("localizationProfile.taxType")}
                      control={control}
                      useForm
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Controller
                      name={`tax_components.${index}.sequence`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} type="number" label={t("localizationProfile.sequence")} fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <IconButton color="error" onClick={() => remove(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/settings/localization-profiles")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
