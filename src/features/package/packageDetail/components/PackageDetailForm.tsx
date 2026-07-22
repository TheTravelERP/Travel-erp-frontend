// src/features/package/packageDetail/components/PackageDetailForm.tsx

import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getPackageDetailSchema } from "../packageDetail.schema";
import type { PackageDetailFormInput } from "../packageDetail.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FileUploadField from "../../../../components/common/FileUploadField";
import { uploadFile } from "../../../../services/upload.service";

interface PackageDetailFormProps {
  defaultValues?: Partial<PackageDetailFormInput>;
  onSubmit: (data: PackageDetailFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  title: "",
  overview: "",
  itinerary: [],
  inclusions: "",
  exclusions: "",
  terms_conditions: "",
  payment_policy: "",
  cancellation_policy: "",
  important_notes: "",
  brochure_path: "",
  is_active: true,
};

export default function PackageDetailForm({
  defaultValues,
  onSubmit,
  loading = false,
}: PackageDetailFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const packageDetailSchema = useMemo(() => getPackageDetailSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<PackageDetailFormInput>({
    resolver: zodResolver(packageDetailSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageDetail.title")}
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
                  label={t("packageDetail.active")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="overview"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageDetail.overview")}
                  fullWidth
                  multiline
                  rows={2}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="inclusions"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageDetail.inclusions")} fullWidth multiline rows={3} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="exclusions"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageDetail.exclusions")} fullWidth multiline rows={3} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ITINERARY */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            {t("packageDetail.itinerary")}
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => append({ day: fields.length + 1, title: "", description: "" })}
          >
            {t("packageDetail.addDay")}
          </Button>
        </Stack>

        {fields.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t("packageDetail.noDaysYet")}
          </Typography>
        )}

        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Grid container spacing={2} key={field.id} alignItems="flex-start">
              <Grid size={{ xs: 3, sm: 1.5 }}>
                <Controller
                  name={`itinerary.${index}.day`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      label={t("packageDetail.day")}
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 9, sm: 4 }}>
                <Controller
                  name={`itinerary.${index}.title`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label={t("packageDetail.dayTitle")}
                      fullWidth
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 11, sm: 6 }}>
                <Controller
                  name={`itinerary.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={t("packageDetail.dayDescription")} fullWidth />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 1, sm: 0.5 }}>
                <IconButton color="error" onClick={() => remove(index)} title={t("packageDetail.removeDay")}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Paper>

      {/* POLICIES */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="terms_conditions"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageDetail.termsConditions")} fullWidth multiline rows={3} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="payment_policy"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageDetail.paymentPolicy")} fullWidth multiline rows={3} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="cancellation_policy"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageDetail.cancellationPolicy")} fullWidth multiline rows={3} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="important_notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("packageDetail.importantNotes")} fullWidth multiline rows={3} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FileUploadField
              label={t("packageDetail.brochure")}
              variant="document"
              value={watch("brochure_path") || null}
              onUpload={async (file) => (await uploadFile(file, "package_detail", "brochure")).url}
              onChange={(url) => setValue("brochure_path", url ?? "")}
              accept="image/jpeg,image/png,image/webp,application/pdf"
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/packages/details")}>
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="error" onClick={() => reset()} size="large">
            {t("common.discard")}
          </Button>

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? t("common.saving") : t("common.save")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
