// src/features/package/packagePricing/components/PackagePricingForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getPackagePricingSchema } from "../packagePricing.schema";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import type { PackagePricingFormInput } from "../packagePricing.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormActions from "../../../../components/forms/FormActions";
import { getPackageByUuid } from "../../package.api";

interface PackagePricingFormProps {
  defaultValues?: Partial<PackagePricingFormInput>;
  onSubmit: (data: PackagePricingFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  package_uuid: "",
  occupancy_type: "",
  passenger_type: "",
  price_category: "Normal",
  currency_code: "",
  price: 0,
  effective_from: "",
  effective_to: "",
  is_default: false,
  is_active: true,
};

export default function PackagePricingForm({
  defaultValues,
  onSubmit,
  loading = false,
}: PackagePricingFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const packagePricingSchema = useMemo(() => getPackagePricingSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<PackagePricingFormInput>({
    resolver: zodResolver(packagePricingSchema),
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
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <EntityAutocomplete
                  name="package_uuid"
                  label={t("packagePricing.package")}
                  control={control}
                  dropdownName="packages"
                  setValue={setValue}
                  onOptionSelected={async (option) => {
                    if (!option) {
                      setValue("currency_code", "", { shouldDirty: true, shouldValidate: true });
                      return;
                    }
                    // Currency is locked to the parent Package (see
                    // pkg_pricing_service.py's currency-match validation) —
                    // fetched here rather than via meta_columns since
                    // "packages" dropdown_config doesn't carry currency_code.
                    const pkg = await getPackageByUuid(option.value);
                    setValue("currency_code", pkg.currency_code, { shouldDirty: true, shouldValidate: true });
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DropdownAutocomplete
                  name="price_category"
                  label={t("packagePricing.priceCategory")}
                  control={control}
                  dropdownName="price_category"
                  useForm
                  allowAdd
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <DropdownAutocomplete
                  name="occupancy_type"
                  label={t("packagePricing.occupancyType")}
                  control={control}
                  dropdownName="occupancy_type"
                  useForm
                  allowAdd
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <DropdownAutocomplete
                  name="passenger_type"
                  label={t("packagePricing.passengerType")}
                  control={control}
                  dropdownName="passenger_type"
                  useForm
                  allowAdd
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 2 }}>
                <Controller
                  name="currency_code"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t("packagePricing.currencyCode")}
                      fullWidth
                      required
                      slotProps={{ input: { readOnly: true } }}
                      helperText={fieldState.error?.message ?? t("packagePricing.currencyFromPackage")}
                      error={!!fieldState.error}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 2 }}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t("packagePricing.price")}
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name="effective_from"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="date"
                      label={t("packagePricing.effectiveFrom")}
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name="effective_to"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label={t("packagePricing.effectiveTo")}
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }} sx={{ display: "flex", alignItems: "center" }}>
                <Controller
                  name="is_default"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label={t("packagePricing.isDefault")}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }} sx={{ display: "flex", alignItems: "center" }}>
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
            </Grid>
          </Paper>
        </Grid>

        <FormActions
          onBack={() => navigate("/app/packages/pricing")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
