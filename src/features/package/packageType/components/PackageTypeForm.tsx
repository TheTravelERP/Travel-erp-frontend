// src/features/package/packageType/components/PackageTypeForm.tsx

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

import { getPackageTypeSchema } from "../packageType.schema";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import type { PackageTypeFormInput } from "../packageType.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormActions from "../../../../components/forms/FormActions";

interface PackageTypeFormProps {
  defaultValues?: Partial<PackageTypeFormInput>;
  onSubmit: (data: PackageTypeFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  code: "",
  name: "",
  category: "",
  description: "",
  sort_order: 0,
  is_active: true,
};

export default function PackageTypeForm({
  defaultValues,
  onSubmit,
  loading = false,
}: PackageTypeFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const packageTypeSchema = useMemo(() => getPackageTypeSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PackageTypeFormInput>({
    resolver: zodResolver(packageTypeSchema),
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
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t("packageType.code")}
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 5 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t("packageType.name")}
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <DropdownAutocomplete
                  name="category"
                  label={t("packageType.category")}
                  control={control}
                  useForm
                  allowAdd
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t("packageType.description")}
                      fullWidth
                      multiline
                      rows={2}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="sort_order"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t("packageType.sortOrder")}
                      fullWidth
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
                      label={t("packageType.active")}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <FormActions
          onBack={() => navigate("/app/packages/types")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
