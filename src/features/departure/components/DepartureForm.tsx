// src/features/departure/components/DepartureForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getDepartureSchema } from "../departure.schema";
import { DEPARTURE_STATUSES } from "../departure.types";
import type { DepartureFormInput } from "../departure.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import BranchMultiSelect from "../../../components/common/BranchMultiSelect";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import FormSection from "../../../components/forms/FormSection";
import FormActions from "../../../components/forms/FormActions";

interface DepartureFormProps {
  defaultValues?: Partial<DepartureFormInput>;
  departureCode?: string;
  onSubmit: (data: DepartureFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: DepartureFormInput = {
  pkg_uuid: "",
  sales_executive_uuid: "",
  departure_name: "",
  departure_date: "",
  return_date: "",
  status: "Draft",
  total_seats: 0,
  minimum_pax: undefined,
  maximum_pax: undefined,
  waitlist_seats: 0,
  remarks: "",
  internal_notes: "",
  is_active: true,
  allowed_branch_uuids: [],
};

export default function DepartureForm({
  defaultValues,
  departureCode,
  onSubmit,
  loading = false,
}: DepartureFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const departureSchema = useMemo(() => getDepartureSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DepartureFormInput>({
    resolver: zodResolver(departureSchema),
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
        <FormSection title={t("menu.packages.departures")}>
          {departureCode && (
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField label={t("departure.code")} value={departureCode} fullWidth disabled />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: departureCode ? 6 : 6 }}>
            <Controller
              name="departure_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("departure.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="pkg_uuid"
              label={t("departure.package")}
              control={control}
              dropdownName="packages"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="sales_executive_uuid"
              label={t("departure.salesExecutive")}
              control={control}
              dropdownName="users"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="departure_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("departure.departureDate")}
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="return_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("departure.returnDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t("common.status")} fullWidth>
                  {DEPARTURE_STATUSES.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {t(`departure.statusValues.${opt}`, { defaultValue: opt })}
                    </MenuItem>
                  ))}
                </TextField>
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

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="total_seats"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("departure.totalSeats")} type="number" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="minimum_pax"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} label={t("departure.minimumPax")} type="number" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="maximum_pax"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} label={t("departure.maximumPax")} type="number" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="waitlist_seats"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("departure.waitlistSeats")} type="number" fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("departure.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="internal_notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("departure.internalNotes")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BranchMultiSelect
              name="allowed_branch_uuids"
              label={t("departure.allowedBranches")}
              control={control}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/packages/departures")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
