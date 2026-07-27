// src/features/settings/documentNumberSeries/components/DocumentNumberSeriesForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getDocumentNumberSeriesSchema } from "../documentNumberSeries.schema";
import type { DocumentNumberSeriesFormInput } from "../documentNumberSeries.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

const RESET_POLICIES = ["Never", "Daily", "Weekly", "Monthly", "Yearly", "Financial Year"] as const;

interface DocumentNumberSeriesFormProps {
  defaultValues?: Partial<DocumentNumberSeriesFormInput>;
  onSubmit: (data: DocumentNumberSeriesFormInput) => Promise<void>;
  loading?: boolean;
  isLocked?: boolean;
  nextNumber?: number;
}

const emptyValues: DocumentNumberSeriesFormInput = {
  branch_uuid: "",
  document_type_uuid: "",
  series_name: "Default",
  prefix: "",
  suffix: "",
  separator: "-",
  number_length: 6,
  starting_number: 1,
  reset_policy: "Never",
  is_default: true,
  effective_from: "",
  effective_to: "",
  is_active: true,
};

export default function DocumentNumberSeriesForm({
  defaultValues,
  onSubmit,
  loading = false,
  isLocked = false,
  nextNumber,
}: DocumentNumberSeriesFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getDocumentNumberSeriesSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DocumentNumberSeriesFormInput>({
    resolver: zodResolver(schema),
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
      {isLocked && (
        <Box mb={2}>
          <Typography variant="body2" color="warning.main">
            {t("documentNumberSeries.lockedFieldsHint")}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <FormSection title={t("menu.settings.doc_numbering")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="branch_uuid"
              label={t("documentNumberSeries.branch")}
              control={control}
              dropdownName="branch"
              disabled={isLocked}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="document_type_uuid"
              label={t("documentNumberSeries.documentType")}
              control={control}
              dropdownName="document_type"
              disabled={isLocked}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="series_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("documentNumberSeries.seriesName")}
                  fullWidth
                  required
                  disabled={isLocked}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="prefix"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("documentNumberSeries.prefix")}
                  fullWidth
                  disabled={isLocked}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="suffix"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("documentNumberSeries.suffix")} fullWidth disabled={isLocked} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="separator"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("documentNumberSeries.separator")} fullWidth disabled={isLocked} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="number_length"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("documentNumberSeries.numberLength")}
                  fullWidth
                  disabled={isLocked}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="starting_number"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("documentNumberSeries.startingNumber")}
                  fullWidth
                  disabled={isLocked}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          {nextNumber !== undefined && (
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label={t("documentNumberSeries.nextNumber")}
                fullWidth
                value={nextNumber}
                disabled
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="reset_policy"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t("documentNumberSeries.resetPolicy")} fullWidth disabled={isLocked}>
                  {RESET_POLICIES.map((policy) => (
                    <MenuItem key={policy} value={policy}>
                      {policy}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="effective_from"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("documentNumberSeries.effectiveFrom")}
                  type="date"
                  fullWidth
                  disabled={isLocked}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="effective_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("documentNumberSeries.effectiveTo")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={isLocked} />
                  }
                  label={t("documentNumberSeries.default")}
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
                  label={t("common.active")}
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/settings/doc-numbering")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
