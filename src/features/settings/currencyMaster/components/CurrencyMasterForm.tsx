// src/features/settings/currencyMaster/components/CurrencyMasterForm.tsx

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

import { getCurrencyMasterSchema } from "../currencyMaster.schema";
import type { CurrencyMasterFormInput } from "../currencyMaster.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import { useCodeUniquenessCheck } from "../../../../hooks/useCodeUniquenessCheck";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface CurrencyMasterFormProps {
  defaultValues?: Partial<CurrencyMasterFormInput> & { uuid?: string };
  onSubmit: (data: CurrencyMasterFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: CurrencyMasterFormInput = {
  code: "",
  name: "",
  symbol: "",
  decimal_places: 2,
  is_active: true,
};

export default function CurrencyMasterForm({
  defaultValues,
  onSubmit,
  loading = false,
}: CurrencyMasterFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const currencyMasterSchema = useMemo(() => getCurrencyMasterSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<CurrencyMasterFormInput>({
    resolver: zodResolver(currencyMasterSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const { onCodeBlur } = useCodeUniquenessCheck<CurrencyMasterFormInput>({
    entity: "currency_master",
    fieldName: "code",
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
    >
      <Grid container spacing={2}>
        <FormSection title={t("menu.settings.currency_master")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    field.onBlur();
                    onCodeBlur(e.target.value);
                  }}
                  label={t("currencyMaster.code")}
                  fullWidth
                  required
                  inputProps={{ maxLength: 3, style: { textTransform: "uppercase" } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("currencyMaster.name")}
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
              name="symbol"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("currencyMaster.symbol")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="decimal_places"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("currencyMaster.decimalPlaces")}
                  fullWidth
                  inputProps={{ min: 0, max: 6 }}
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
          onBack={() => navigate("/app/settings/currency-master")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
