// src/features/crm/quotation/components/QuotationForm.tsx
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { getQuotationSchema } from "../quotation.schema";
import { SERVICE_TYPES, type QuotationFormInput } from "../quotation.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface Props {
  defaultValues?: Partial<QuotationFormInput>;
  onSubmit: (data: QuotationFormInput) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

const emptyValues: QuotationFormInput = {
  enquiry_uuid: "",
  pkg_uuid: null,
  quotation_date: new Date().toISOString().slice(0, 10),
  valid_until: "",
  travel_date_from: "",
  travel_date_to: "",
  pax_adult: 1,
  pax_child: 0,
  pax_infant: 0,
  currency_code: "INR",
  terms_conditions: "",
  internal_notes: "",
  customer_notes: "",
  service_lines: [],
};

const emptyLine = {
  service_type: "Hotel",
  vendor_uuid: null,
  description: "",
  quantity: 1,
  cost_price: 0,
  selling_price: 0,
  discount_percent: 0,
};

export default function QuotationForm({ defaultValues, onSubmit, disabled = false, disabledReason }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getQuotationSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<QuotationFormInput>({
    resolver: zodResolver(schema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "service_lines" });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const linesError =
    errors.service_lines && !Array.isArray(errors.service_lines)
      ? (errors.service_lines as any)?.message
      : undefined;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      {disabled && disabledReason && (
        <Box mb={2}>
          <Typography variant="body2" color="warning.main">{disabledReason}</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <FormSection title={t("quotation.sectionDetails")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="enquiry_uuid"
              label={t("quotation.enquiry")}
              control={control}
              dropdownName="enquiries"
              disabled={disabled}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="pkg_uuid"
              label={t("quotation.package")}
              control={control}
              dropdownName="packages"
              disabled={disabled}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="quotation_date"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("quotation.quotationDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="valid_until"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("quotation.validUntil")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="travel_date_from"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("quotation.travelDateFrom")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="travel_date_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} type="date" label={t("quotation.travelDateTo")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="pax_adult" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.paxAdult")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="pax_child" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.paxChild")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="pax_infant" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("quotation.paxInfant")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="currency_code" control={control} render={({ field, fieldState }) => (
              <TextField {...field} label={t("quotation.currencyCode")} fullWidth disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
            )} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller name="terms_conditions" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.termsConditions")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="internal_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.internalNotes")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="customer_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.customerNotes")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
        </FormSection>

        <FormSection
          title={t("quotation.serviceLines")}
          titleAdornment={
            !disabled && (
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => append({ ...emptyLine })} sx={{ ml: 2 }}>
                {t("quotation.addLine")}
              </Button>
            )
          }
        >
          {linesError && (
            <Grid size={{ xs: 12 }}>
              <Typography color="error" variant="body2">{linesError}</Typography>
            </Grid>
          )}

          {fields.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">{t("quotation.noLinesYet")}</Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Grid container spacing={1.5} key={field.id} alignItems="center">
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Controller
                      name={`service_lines.${index}.service_type`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} select label={t("quotation.serviceType")} fullWidth disabled={disabled}>
                          {SERVICE_TYPES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Controller
                      name={`service_lines.${index}.description`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} label={t("quotation.description")} fullWidth disabled={disabled} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.2 }}>
                    <Controller
                      name={`service_lines.${index}.quantity`}
                      control={control}
                      render={({ field: f, fieldState }) => (
                        <TextField {...f} type="number" label={t("quotation.quantity")} fullWidth disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.4 }}>
                    <Controller
                      name={`service_lines.${index}.cost_price`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} type="number" label={t("quotation.costPrice")} fullWidth disabled={disabled} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.4 }}>
                    <Controller
                      name={`service_lines.${index}.selling_price`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} type="number" label={t("quotation.sellingPrice")} fullWidth disabled={disabled} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.4 }}>
                    <Controller
                      name={`service_lines.${index}.discount_percent`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField {...f} type="number" label={t("quotation.discountPercent")} fullWidth disabled={disabled} />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 1.6 }}>
                    <EntityAutocomplete
                      name={`service_lines.${index}.vendor_uuid`}
                      label={t("quotation.vendor")}
                      control={control}
                      dropdownName="vendors"
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 0.4 }}>
                    {!disabled && (
                      <IconButton color="error" onClick={() => remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Grid>
        </FormSection>

        {!disabled && (
          <FormActions
            onBack={() => navigate("/app/crm/quotations")}
            onDiscard={() => reset()}
            submitting={isSubmitting}
          />
        )}
      </Grid>
    </Box>
  );
}
