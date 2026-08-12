// src/features/settings/location/components/LocationForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getLocationSchema } from "../location.schema";
import type { LocationFormInput } from "../location.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import AddStateProvinceDialog from "./AddStateProvinceDialog";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import { useCodeUniquenessCheck } from "../../../../hooks/useCodeUniquenessCheck";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface LocationFormProps {
  defaultValues?: Partial<LocationFormInput> & { uuid?: string };
  onSubmit: (data: LocationFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: LocationFormInput = {
  code: "",
  name: "",
  country_code: "",
  city_code: "",
  remarks: "",
  is_active: true,
};

export default function LocationForm({
  defaultValues,
  onSubmit,
  loading = false,
}: LocationFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const locationSchema = useMemo(() => getLocationSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<LocationFormInput>({
    resolver: zodResolver(locationSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const countryCode = watch("country_code");
  const [addStateProvinceOpen, setAddStateProvinceOpen] = useState(false);

  // Location's code is unique per-org (no extra scoping field needed).
  const { onCodeBlur } = useCodeUniquenessCheck<LocationFormInput>({
    entity: "location",
    fieldName: "code",
    excludeUuid: defaultValues?.uuid,
    setError,
    clearErrors,
    message: t("validation.codeAlreadyExists"),
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("location.title")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    onCodeBlur(e.target.value);
                  }}
                  label={t("common.code")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("common.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="country_code"
              label={t("common.country")}
              control={control}
              dropdownName="country"
              // Changing Country invalidates any previously-selected
              // State/Province — fires only on an actual user selection
              // (never on the reset() that loads defaultValues for Edit),
              // so an existing Location's State/Province isn't wiped out
              // just from opening the form.
              onOptionSelected={() => setValue("city_code", "")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="city_code"
              label={t("location.stateProvince")}
              control={control}
              // dropdownName/field name stay "city" — the underlying
              // dropdown_config row and API field are unchanged by the
              // Phase 4B City -> State/Province business rename (see
              // city_routes.py's module docstring on the backend).
              dropdownName="city"
              // Scoped to the selected Country server-side (never just a
              // frontend filter) — see dropdown_entity_service.py's
              // country_code filter. Disabled until a Country is chosen,
              // since "which State/Province" has no meaning before then.
              countryCode={countryCode || null}
              disabled={!countryCode}
              allowAdd
              onAddNew={() => setAddStateProvinceOpen(true)}
            />
          </Grid>

          <AddStateProvinceDialog
            open={addStateProvinceOpen}
            countryCode={countryCode || ""}
            onClose={() => setAddStateProvinceOpen(false)}
            onCreated={(stateProvince) => {
              setValue("city_code", stateProvince.city_code);
              setAddStateProvinceOpen(false);
            }}
          />

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
                <TextField {...field} label={t("location.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/settings/location-master")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
