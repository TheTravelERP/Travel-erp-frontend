// src/features/inventory/hotel/components/HotelForm.tsx

import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getHotelSchema } from "../hotel.schema";
import type { HotelFormInput } from "../hotel.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";

interface HotelFormProps {
  defaultValues?: Partial<HotelFormInput>;
  onSubmit: (data: HotelFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  hotel_code: "",
  hotel_name: "",
  hotel_group: "",
  star_rating: undefined,
  city: "",
  state: "",
  country: "",
  address: "",
  latitude: undefined,
  longitude: undefined,
  google_map: "",
  distance_from_haram: undefined,
  phone: "",
  email: "",
  website: "",
  check_in_time: "",
  check_out_time: "",
  contact_person: "",
  remarks: "",
  is_active: true,
};

export default function HotelForm({ defaultValues, onSubmit, loading = false }: HotelFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const hotelSchema = useMemo(() => getHotelSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<HotelFormInput>({
    resolver: zodResolver(hotelSchema),
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
      {/* BASIC INFO */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t("hotel.basicInfo")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="hotel_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("hotel.code")}
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
              name="hotel_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("hotel.name")}
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
              name="hotel_group"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.group")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="star_rating"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("hotel.starRating")}
                  fullWidth
                  slotProps={{ htmlInput: { min: 1, max: 5 } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="contact_person"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.contactPerson")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="check_in_time"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="time"
                  label={t("hotel.checkInTime")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="check_out_time"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="time"
                  label={t("hotel.checkOutTime")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex", alignItems: "center" }}>
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

      {/* LOCATION */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t("hotel.locationSection")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.city")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="state"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.state")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="country"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.country")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("hotel.address")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("hotel.latitude")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("hotel.longitude")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="google_map"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.googleMap")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="distance_from_haram"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("hotel.distanceFromHaram")} fullWidth />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* CONTACT */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t("hotel.contactSection")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.phone")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.email")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="website"
              control={control}
              render={({ field }) => <TextField {...field} label={t("hotel.website")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("hotel.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/inventory/hotels")}>
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
