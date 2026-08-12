// src/features/settings/stateProvinceMaster/components/StateProvinceForm.tsx

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

import { getStateProvinceSchema } from "../stateProvince.schema";
import type { StateProvinceFormInput } from "../stateProvince.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import { useCodeUniquenessCheck } from "../../../../hooks/useCodeUniquenessCheck";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface StateProvinceFormProps {
  defaultValues?: Partial<StateProvinceFormInput> & { uuid?: string };
  onSubmit: (data: StateProvinceFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: StateProvinceFormInput = {
  country_code: "",
  city_code: "",
  name: "",
  is_active: true,
};

export default function StateProvinceForm({
  defaultValues,
  onSubmit,
  loading = false,
}: StateProvinceFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const stateProvinceSchema = useMemo(() => getStateProvinceSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<StateProvinceFormInput>({
    resolver: zodResolver(stateProvinceSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const countryCode = watch("country_code");

  // Code is unique per-Country (composite scope, see city_master's
  // uq_country_city_code constraint) — the on-blur check needs the
  // currently-selected Country to check meaningfully.
  const { onCodeBlur } = useCodeUniquenessCheck<StateProvinceFormInput>({
    entity: "city_master",
    fieldName: "city_code",
    extraScopeValue: countryCode,
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
        <FormSection title={t("menu.settings.state_province_master")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="country_code"
              label={t("common.country")}
              control={control}
              dropdownName="country"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="city_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  onBlur={(e) => {
                    field.onBlur();
                    onCodeBlur(e.target.value);
                  }}
                  label={t("common.code")}
                  fullWidth
                  required
                  inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
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
                  label={t("common.name")}
                  fullWidth
                  required
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
          onBack={() => navigate("/app/settings/state-province-master")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
