// src/features/inventory/ziyarat/components/ZiyaratForm.tsx

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

import { getZiyaratSchema } from "../ziyarat.schema";
import type { ZiyaratFormInput } from "../ziyarat.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";

interface ZiyaratFormProps {
  defaultValues?: Partial<ZiyaratFormInput>;
  onSubmit: (data: ZiyaratFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  name: "",
  city: "",
  duration_hours: undefined,
  description: "",
  places_covered: "",
  default_cost: undefined,
  pickup_location: "",
  drop_location: "",
  remarks: "",
  is_active: true,
};

export default function ZiyaratForm({ defaultValues, onSubmit, loading = false }: ZiyaratFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const ziyaratSchema = useMemo(() => getZiyaratSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ZiyaratFormInput>({
    resolver: zodResolver(ziyaratSchema),
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
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("ziyarat.name")}
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
              name="city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("ziyarat.city")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="duration_hours"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("ziyarat.durationHours")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="pickup_location"
              control={control}
              render={({ field }) => <TextField {...field} label={t("ziyarat.pickupLocation")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="drop_location"
              control={control}
              render={({ field }) => <TextField {...field} label={t("ziyarat.dropLocation")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="default_cost"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("ziyarat.defaultCost")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
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
              name="places_covered"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("ziyarat.placesCovered")}
                  fullWidth
                  multiline
                  rows={2}
                  helperText={t("ziyarat.placesCoveredHint")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("ziyarat.description")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("ziyarat.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/inventory/ziyarat")}>
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
