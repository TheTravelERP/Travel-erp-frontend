// src/features/settings/serviceType/components/ServiceTypeForm.tsx

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getServiceTypeSchema } from "../serviceType.schema";
import type { ServiceTypeFormInput } from "../serviceType.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface ServiceTypeFormProps {
  defaultValues?: Partial<ServiceTypeFormInput>;
  onSubmit: (data: ServiceTypeFormInput) => Promise<void>;
  loading?: boolean;
  isSystem?: boolean;
}

const emptyValues: ServiceTypeFormInput = {
  code: "",
  name: "",
  description: "",
  is_active: true,
};

export default function ServiceTypeForm({
  defaultValues,
  onSubmit,
  loading = false,
  isSystem = false,
}: ServiceTypeFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const serviceTypeSchema = useMemo(() => getServiceTypeSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ServiceTypeFormInput>({
    resolver: zodResolver(serviceTypeSchema),
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
        {isSystem && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">{t("serviceType.systemCannotEdit")}</Alert>
          </Grid>
        )}

        <FormSection title={t("menu.settings.service_type_master")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("serviceType.code")}
                  fullWidth
                  required
                  disabled={isSystem}
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
                  label={t("serviceType.name")}
                  fullWidth
                  required
                  disabled={isSystem}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("common.description")}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isSystem}
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
                  control={
                    <Switch
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSystem}
                    />
                  }
                  label={t("common.active")}
                />
              )}
            />
          </Grid>
        </FormSection>

        {isSystem ? (
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Button variant="outlined" onClick={() => navigate("/app/settings/service-type-master")}>
              {t("common.back")}
            </Button>
          </Grid>
        ) : (
          <FormActions
            onBack={() => navigate("/app/settings/service-type-master")}
            onDiscard={() => reset()}
            submitting={isSubmitting || loading}
          />
        )}
      </Grid>
    </Box>
  );
}
