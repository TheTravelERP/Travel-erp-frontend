// src/features/inventory/vendorContract/components/VendorContractForm.tsx

import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getVendorContractSchema } from "../vendorContract.schema";
import type { VendorContractFormInput } from "../vendorContract.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";

interface VendorContractFormProps {
  defaultValues?: Partial<VendorContractFormInput>;
  onSubmit: (data: VendorContractFormInput) => Promise<void>;
  loading?: boolean;
}

const STATUS_OPTIONS = ["Active", "Inactive"] as const;

const emptyValues: VendorContractFormInput = {
  vendor_uuid: "",
  contract_code: "",
  contract_name: "",
  contract_type: "",
  reference_no: "",
  valid_from: "",
  valid_to: "",
  currency_code: "",
  payment_terms: "",
  remarks: "",
  status: "Active",
  is_active: true,
};

export default function VendorContractForm({
  defaultValues,
  onSubmit,
  loading = false,
}: VendorContractFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const vendorContractSchema = useMemo(() => getVendorContractSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<VendorContractFormInput>({
    resolver: zodResolver(vendorContractSchema),
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="vendor_uuid"
              label={t("vendorContract.vendor")}
              control={control}
              dropdownName="vendors"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="contract_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("vendorContract.code")}
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
              name="reference_no"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendorContract.referenceNo")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="contract_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("vendorContract.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="contract_type"
              dropdownName="vendor_type"
              label={t("vendorContract.type")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="currency_code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("vendorContract.currency")}
                  fullWidth
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  slotProps={{ htmlInput: { maxLength: 3 } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="valid_from"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("vendorContract.validFrom")}
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
              name="valid_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("vendorContract.validTo")}
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
                <TextField {...field} select label={t("vendorContract.status")} fullWidth>
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt === "Active" ? t("common.active") : t("common.inactive")}
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

          <Grid size={{ xs: 12 }}>
            <Controller
              name="payment_terms"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("vendorContract.paymentTerms")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("vendorContract.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/inventory/contracts")}>
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
