// src/features/inventory/vendor/components/VendorForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getVendorSchema } from "../vendor.schema";
import type { VendorFormInput } from "../vendor.types";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import MobileNumberField from "../../../../components/common/MobileNumberField";
import AddStateProvinceDialog from "../../../settings/location/components/AddStateProvinceDialog";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import { useCodeUniquenessCheck } from "../../../../hooks/useCodeUniquenessCheck";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface VendorFormProps {
  defaultValues?: Partial<VendorFormInput> & { uuid?: string };
  onSubmit: (data: VendorFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: VendorFormInput = {
  vendor_code: "",
  vendor_name: "",
  contact_person: "",
  mobile: "",
  email: "",
  website: "",
  gstin: "",
  pan: "",
  address: "",
  city: "",
  country_code: "",
  state_province_code: "",
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
    setValue,
    watch,
    setError,
    clearErrors,
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

  const { onCodeBlur } = useCodeUniquenessCheck<VendorFormInput>({
    entity: "vendor",
    fieldName: "vendor_code",
    excludeUuid: defaultValues?.uuid,
    setError,
    clearErrors,
    message: t("validation.codeAlreadyExists"),
  });

  const countryCode = watch("country_code");
  const [addStateProvinceOpen, setAddStateProvinceOpen] = useState(false);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        {/* ---------- Basic Information ---------- */}
        <FormSection title={t("vendor.sectionBasic")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="vendor_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    onCodeBlur(e.target.value);
                  }}
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
              name="status"
              dropdownName="vendor_status"
              label={t("vendor.status")}
              control={control}
              useForm
              allowAdd={false}
            />
            <Typography variant="caption" color="text.secondary">
              {t("vendor.statusHelper")}
            </Typography>
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

        {/* ---------- Contact Information ---------- */}
        <FormSection title={t("vendor.sectionContact")}>
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
        </FormSection>

        {/* ---------- Address ---------- */}
        <FormSection title={t("common.address")}>
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
            <EntityAutocomplete
              name="country_code"
              label={t("common.country")}
              control={control}
              dropdownName="country"
              onOptionSelected={() => setValue("state_province_code", "")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="state_province_code"
              label={t("location.stateProvince")}
              control={control}
              dropdownName="city"
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
              setValue("state_province_code", stateProvince.city_code);
              setAddStateProvinceOpen(false);
            }}
          />

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.city")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.pincode")} fullWidth />}
            />
          </Grid>
        </FormSection>

        {/* ---------- Tax / Registration ---------- */}
        <FormSection title={t("vendor.sectionTax")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="gstin"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.gstin")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="pan"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.pan")} fullWidth />}
            />
          </Grid>
        </FormSection>

        {/* ---------- Additional Information ---------- */}
        <FormSection title={t("vendor.sectionAdditional")}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="payment_terms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("vendor.paymentTermsDefault")}
                  helperText={t("vendor.paymentTermsHelper")}
                  fullWidth
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
