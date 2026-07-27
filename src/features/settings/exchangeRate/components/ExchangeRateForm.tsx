// src/features/settings/exchangeRate/components/ExchangeRateForm.tsx

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

import { getExchangeRateSchema } from "../exchangeRate.schema";
import type { ExchangeRateFormInput } from "../exchangeRate.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface ExchangeRateFormProps {
  defaultValues?: Partial<ExchangeRateFormInput>;
  onSubmit: (data: ExchangeRateFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: ExchangeRateFormInput = {
  from_currency_code: "",
  to_currency_code: "",
  rate: "",
  effective_from: "",
  effective_to: "",
  is_active: true,
};

export default function ExchangeRateForm({
  defaultValues,
  onSubmit,
  loading = false,
}: ExchangeRateFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const exchangeRateSchema = useMemo(() => getExchangeRateSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ExchangeRateFormInput>({
    resolver: zodResolver(exchangeRateSchema),
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
        <FormSection title={t("menu.settings.exchange_rate_master")}>
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
            <Controller
              name="rate"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("exchangeRate.rate")}
                  fullWidth
                  required
                  inputProps={{ step: "0.00000001", min: 0 }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

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
          onBack={() => navigate("/app/settings/exchange-rate-master")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
