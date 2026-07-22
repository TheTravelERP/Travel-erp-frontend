// src/features/inventory/airline/components/AirlineForm.tsx

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

import { getAirlineSchema } from "../airline.schema";
import type { AirlineFormInput } from "../airline.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";

interface AirlineFormProps {
  defaultValues?: Partial<AirlineFormInput>;
  onSubmit: (data: AirlineFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  airline_code: "",
  icao_code: "",
  airline_name: "",
  country: "",
  website: "",
  logo: "",
  phone: "",
  email: "",
  remarks: "",
  is_active: true,
};

export default function AirlineForm({ defaultValues, onSubmit, loading = false }: AirlineFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const airlineSchema = useMemo(() => getAirlineSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AirlineFormInput>({
    resolver: zodResolver(airlineSchema),
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="airline_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("airline.code")}
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
              name="icao_code"
              control={control}
              render={({ field }) => <TextField {...field} label={t("airline.icaoCode")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="airline_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("airline.name")}
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
              name="country"
              control={control}
              render={({ field }) => <TextField {...field} label={t("airline.country")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="website"
              control={control}
              render={({ field }) => <TextField {...field} label={t("airline.website")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="logo"
              control={control}
              render={({ field }) => <TextField {...field} label={t("airline.logo")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <TextField {...field} label={t("airline.phone")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextField {...field} label={t("airline.email")} fullWidth />}
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

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("airline.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/inventory/airlines")}>
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
