// src/features/inventory/guide/components/GuideForm.tsx

import {
  Box,
  Button,
  Divider,
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

import { getGuideSchema } from "../guide.schema";
import type { GuideFormInput } from "../guide.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";

interface GuideFormProps {
  defaultValues?: Partial<GuideFormInput>;
  onSubmit: (data: GuideFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  guide_name: "",
  mobile: "",
  email: "",
  languages: "",
  license_no: "",
  experience_years: undefined,
  remarks: "",
  is_active: true,
};

export default function GuideForm({ defaultValues, onSubmit, loading = false }: GuideFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const guideSchema = useMemo(() => getGuideSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<GuideFormInput>({
    resolver: zodResolver(guideSchema),
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
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="guide_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("guide.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="mobile"
              control={control}
              render={({ field }) => <TextField {...field} label={t("guide.mobile")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextField {...field} label={t("guide.email")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("guide.languages")}
                  fullWidth
                  helperText={t("guide.languagesHint")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="license_no"
              control={control}
              render={({ field }) => <TextField {...field} label={t("guide.licenseNo")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
            <Controller
              name="experience_years"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("guide.experienceYears")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }} sx={{ display: "flex", alignItems: "center" }}>
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

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("guide.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/inventory/guides")}>
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
