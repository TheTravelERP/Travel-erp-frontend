// src/features/package/components/PackageForm.tsx

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

import { getPackageSchema } from "../package.schema";
import type { PackageFormInput } from "../package.types";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";

interface PackageFormProps {
  defaultValues?: Partial<PackageFormInput>;
  onSubmit: (data: PackageFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  package_type_uuid: null,
  package_detail_uuid: null,
  code: "",
  name: "",
  short_name: "",
  status: "Draft",
  departure_city: "",
  arrival_city: "",
  country: "",
  departure_date: "",
  return_date: "",
  booking_start_date: "",
  booking_end_date: "",
  duration_days: 0,
  duration_nights: 0,
  minimum_pax: undefined,
  maximum_pax: undefined,
  total_seats: 0,
  booked_seats: 0,
  blocked_seats: 0,
  waitlist_seats: 0,
  currency_code: "INR",
  exchange_rate: 1,
  featured: false,
  is_active: true,
};

export default function PackageForm({ defaultValues, onSubmit, loading = false }: PackageFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const packageSchema = useMemo(() => getPackageSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<PackageFormInput>({
    resolver: zodResolver(packageSchema),
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
          {t("package.basicInfo")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="package_type_uuid"
              label={t("package.packageType")}
              control={control}
              dropdownName="package_types"
              setValue={setValue}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="package_detail_uuid"
              label={t("package.packageDetail")}
              control={control}
              dropdownName="package_details"
              setValue={setValue}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("package.code")}
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
                  label={t("package.name")}
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
              name="short_name"
              control={control}
              render={({ field }) => <TextField {...field} label={t("package.shortName")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="status"
              label={t("package.status")}
              control={control}
              dropdownName="package_status"
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("package.featured")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("package.active")}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ROUTE & DATES */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t("package.routeSection")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="departure_city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("package.departureCity")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="arrival_city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("package.arrivalCity")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="country"
              control={control}
              render={({ field }) => <TextField {...field} label={t("package.country")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="departure_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("package.departureDate")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="return_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("package.returnDate")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="booking_start_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("package.bookingStartDate")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="booking_end_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("package.bookingEndDate")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* DURATION & CAPACITY */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t("package.durationSection")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="duration_days"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("package.durationDays")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="duration_nights"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("package.durationNights")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="minimum_pax"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("package.minimumPax")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="maximum_pax"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("package.maximumPax")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="total_seats"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("package.totalSeats")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="booked_seats"
              control={control}
              render={({ field }) => <TextField {...field} type="number" label={t("package.bookedSeats")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="blocked_seats"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("package.blockedSeats")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Controller
              name="waitlist_seats"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("package.waitlistSeats")} fullWidth />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* CURRENCY */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t("package.currencySection")}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="currency_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("package.currencyCode")}
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
              name="exchange_rate"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" label={t("package.exchangeRate")} fullWidth />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/packages/list")}>
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
