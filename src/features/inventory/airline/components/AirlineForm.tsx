// src/features/inventory/airline/components/AirlineForm.tsx

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

import { getAirlineSchema } from "../airline.schema";
import type { AirlineFormInput } from "../airline.types";
import MobileNumberField from "../../../../components/common/MobileNumberField";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

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
  default_tax_treatment: null,
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
      <Grid container spacing={2}>
        <FormSection title={t("common.generalInfo")}>
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
            <MobileNumberField name="phone" control={control} label={t("airline.phone")} />
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
        </FormSection>

        {/* Optional, collapsed — a Flight line routed through an
            unconfigured airline just resolves to undetermined (blocked at
            quotation save time, never here). Same convention as
            LocalizationProfileForm's Tax Configuration section. */}
        <Grid size={{ xs: 12 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{t("common.taxConfiguration")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("airline.taxConfigurationHelp")}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DropdownAutocomplete
                    name="default_tax_treatment"
                    dropdownName="airline_default_tax_treatment"
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
          onBack={() => navigate("/app/inventory/airlines")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
