// src/features/inventory/vendor/components/VendorForm.tsx

import {
  Box,
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

import { getVendorSchema } from "../vendor.schema";
import type { VendorFormInput } from "../vendor.types";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import MobileNumberField from "../../../../components/common/MobileNumberField";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface VendorFormProps {
  defaultValues?: Partial<VendorFormInput>;
  onSubmit: (data: VendorFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: VendorFormInput = {
  vendor_code: "",
  vendor_name: "",
  vendor_type: "",
  contact_person: "",
  mobile: "",
  email: "",
  website: "",
  gstin: "",
  pan: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  payment_terms: "",
  remarks: "",
  status: "Active",
  is_active: true,
};

export default function VendorForm({
  defaultValues,
  onSubmit,
  loading = false,
}: VendorFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const vendorSchema = useMemo(() => getVendorSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<VendorFormInput>({
    resolver: zodResolver(vendorSchema),
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
        <FormSection title={t("vendor.title")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="vendor_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("vendor.code")}
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
              name="vendor_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("vendor.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="vendor_type"
              label={t("vendor.type")}
              control={control}
              useForm
              allowAdd
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="contact_person"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.contactPerson")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MobileNumberField name="mobile" control={control} label={t("vendor.mobile")} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.email")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="website"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.website")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="gstin"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.gstin")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="pan"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.pan")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("vendor.address")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.city")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="state"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.state")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="country"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.country")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.pincode")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="payment_terms"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.paymentTerms")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="status"
              dropdownName="vendor_status"
              label={t("vendor.status")}
              control={control}
              useForm
              allowAdd={false}
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
                <TextField {...field} label={t("vendor.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/inventory/vendor-master")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
