// src/features/package/packageService/components/PackageServiceForm.tsx

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

import { getPackageServiceSchema } from "../packageService.schema";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import type { PackageServiceFormInput } from "../packageService.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface PackageServiceFormProps {
  defaultValues?: Partial<PackageServiceFormInput>;
  onSubmit: (data: PackageServiceFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  package_uuid: "",
  day_no: 1,
  service_order: 0,
  service_type: "",
  inventory_uuid: "",
  description: "",
  start_datetime: "",
  end_datetime: "",
  cost_price: 0,
  selling_price: undefined,
  remarks: "",
  is_active: true,
};

export default function PackageServiceForm({
  defaultValues,
  onSubmit,
  loading = false,
}: PackageServiceFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const packageServiceSchema = useMemo(() => getPackageServiceSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<PackageServiceFormInput>({
    resolver: zodResolver(packageServiceSchema),
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
                  label={t("packageService.package")}
                  control={control}
                  dropdownName="packages"
                  setValue={setValue}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DropdownAutocomplete
                  name="service_type"
                  label={t("packageService.serviceType")}
                  control={control}
                  dropdownName="service_type"
                  useForm
                  allowAdd
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name="day_no"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t("packageService.dayNo")}
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Controller
                  name="service_order"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="number" label={t("packageService.serviceOrder")} fullWidth />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={t("packageService.description")} fullWidth />
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

        <FormSection title={t("packageService.scheduleSection")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="start_datetime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label={t("packageService.startDatetime")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="end_datetime"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="datetime-local"
                  label={t("packageService.endDatetime")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("packageService.pricingSection")}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="cost_price"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("packageService.costPrice")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="selling_price"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("packageService.sellingPrice")} fullWidth />
              )}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("packageService.inventorySection")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="inventory_uuid"
              label={t("packageService.inventory")}
              control={control}
              dropdownName="inventory_items"
              setValue={setValue}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageService.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/packages/services")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
