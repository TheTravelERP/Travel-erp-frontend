// src/features/settings/currencyRatePolicy/components/CurrencyRatePolicyForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getCurrencyRatePolicySchema } from "../currencyRatePolicy.schema";
import type { CurrencyRatePolicyFormInput } from "../currencyRatePolicy.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface CurrencyRatePolicyFormProps {
  defaultValues?: Partial<CurrencyRatePolicyFormInput>;
  onSubmit: (data: CurrencyRatePolicyFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: CurrencyRatePolicyFormInput = {
  from_currency_code: "",
  to_currency_code: "",
  rate_source: "market",
  markup_percent: "",
  manual_rate: "",
  effective_from: "",
  effective_to: "",
  is_active: true,
};

export default function CurrencyRatePolicyForm({
  defaultValues,
  onSubmit,
  loading = false,
}: CurrencyRatePolicyFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const currencyRatePolicySchema = useMemo(() => getCurrencyRatePolicySchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CurrencyRatePolicyFormInput>({
    resolver: zodResolver(currencyRatePolicySchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const rateSource = useWatch({ control, name: "rate_source" });

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
        <FormSection title={t("menu.settings.currency_rate_policy")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <EntityAutocomplete
              name="from_currency_code"
              label={t("exchangeRate.fromCurrency")}
              control={control}
              dropdownName="currency_master"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <EntityAutocomplete
              name="to_currency_code"
              label={t("exchangeRate.toCurrency")}
              control={control}
              dropdownName="currency_master"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="rate_source"
              label={t("currencyRatePolicy.rateSource")}
              control={control}
              useForm
            />
          </Grid>

          {rateSource === "markup" && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="markup_percent"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t("currencyRatePolicy.markupPercent")}
                    fullWidth
                    inputProps={{ step: "0.001" }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          )}

          {rateSource === "manual" && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="manual_rate"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t("currencyRatePolicy.manualRate")}
                    fullWidth
                    inputProps={{ step: "0.00000001", min: 0 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="effective_from"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("exchangeRate.effectiveFrom")}
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="effective_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("exchangeRate.effectiveTo")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
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
          onBack={() => navigate("/app/settings/currency-rate-policy")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
