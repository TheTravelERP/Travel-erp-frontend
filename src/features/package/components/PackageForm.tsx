// src/features/package/components/PackageForm.tsx

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { getPackageSchema } from "../package.schema";
import type { PackageFormInput } from "../package.types";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import BranchMultiSelect from "../../../components/common/BranchMultiSelect";
import FormSection from "../../../components/forms/FormSection";
import FormActions from "../../../components/forms/FormActions";

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
  allowed_branch_uuids: [],
  default_tax_treatment: null,
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
      <Grid container spacing={2}>
        <FormSection title={t("package.basicInfo")}>
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
        </FormSection>

        <FormSection title={t("package.routeSection")}>
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
        </FormSection>

        <FormSection title={t("package.durationSection")}>
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
        </FormSection>

        <FormSection title={t("package.currencySection")}>
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
        </FormSection>

        <FormSection title={t("package.allowedBranchesSection")}>
          <Grid size={{ xs: 12 }}>
            <BranchMultiSelect
              name="allowed_branch_uuids"
              label={t("package.allowedBranches")}
              control={control}
            />
          </Grid>
        </FormSection>

        {/* Optional, collapsed — this package's own base/Occupancy line
            just resolves to undetermined (blocked at quotation save time,
            never here) until configured. Same convention as
            LocalizationProfileForm/AirlineForm's Tax Configuration section. */}
        <Grid size={{ xs: 12 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{t("common.taxConfiguration")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("package.taxConfigurationHelp")}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DropdownAutocomplete
                    name="default_tax_treatment"
                    dropdownName="package_default_tax_treatment"
                    label={t("common.defaultTaxTreatment")}
                    control={control}
                    useForm
                    allowAdd={false}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <FormActions
          onBack={() => navigate("/app/packages/list")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
