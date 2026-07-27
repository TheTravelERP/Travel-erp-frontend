// src/features/customer/components/CustomerForm.tsx
import {
  Box,
  TextField,
  Grid,
  Stack,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { getCustomerSchema } from "../customer.schema";
import type { z } from "zod";
import CountryAutocomplete from "../../../components/common/CountryAutocomplete";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import FileUploadField from "../../../components/common/FileUploadField";
import MobileNumberField from "../../../components/common/MobileNumberField";
import { useNavigate } from "react-router-dom";
import { uploadFile } from "../../../services/upload.service";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import FormSection from "../../../components/forms/FormSection";
import FormActions from "../../../components/forms/FormActions";

const DOC_SLOTS = ["doc1", "doc2", "doc3", "doc4"] as const;

export type CustomerFormValues = z.infer<ReturnType<typeof getCustomerSchema>>;

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  loading?: boolean;
}

const emptyValues: CustomerFormValues = {
  name: "",
  first_name: "",
  last_name: "",
  gender: "",
  dob: "",
  nationality: "",
  country: "",
  agent_uuid: "",
  passport_no: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_issue_country: "",
  email: "",
  mobile: "",
  alternate_mobile: "",
  gstin: "",
  billing_address: "",
  picture_url: "",
  passport_front_url: "",
  passport_back_url: "",
  doc1_label: "",
  doc1_url: "",
  doc2_label: "",
  doc2_url: "",
  doc3_label: "",
  doc3_url: "",
  doc4_label: "",
  doc4_url: "",
};

export default function CustomerForm({
  defaultValues,
  onSubmit,
  loading = false,
}: CustomerFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const customerSchema = useMemo(() => getCustomerSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const navigate = useNavigate();

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
      sx={{ flexGrow: 1 }}
    >
      <Grid container spacing={2}>
        <FormSection title={t("settings.personalDetails")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("common.customerName")}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MobileNumberField name="mobile" control={control} label={t("common.mobile")} required />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <MobileNumberField
              name="alternate_mobile"
              control={control}
              label={t("customer.alternateMobile")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("common.email")}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("settings.dateOfBirth")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="gender"
              label={t("settings.gender")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CountryAutocomplete
              name="country"
              control={control}
              field="label"
              label={t("customer.country")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CountryAutocomplete
              name="nationality"
              control={control}
              field="nationality"
              label={t("customer.nationality")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="agent_uuid"
              label={t("customer.agent")}
              control={control}
              dropdownName="users"
              allowAdd={false}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("customer.passportDetails")}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="passport_no"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("customer.passportNumber")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="passport_issue_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("customer.passportIssueDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="passport_expiry_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("customer.passportExpiryDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <CountryAutocomplete
              name="passport_issue_country"
              control={control}
              field="label"
              label={t("customer.passportIssueCountry")}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("customer.businessDetails")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="gstin"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("customer.taxId")} fullWidth />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="billing_address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("customer.billingAddress")}
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("customer.documents")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FileUploadField
              label={t("customer.picture")}
              variant="avatar"
              value={watch("picture_url") || null}
              onUpload={async (file) => (await uploadFile(file, "customer", "picture")).url}
              onChange={(url) => setValue("picture_url", url ?? "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FileUploadField
              label={t("customer.passportFront")}
              variant="document"
              value={watch("passport_front_url") || null}
              onUpload={async (file) => (await uploadFile(file, "customer", "passport_front")).url}
              onChange={(url) => setValue("passport_front_url", url ?? "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FileUploadField
              label={t("customer.passportBack")}
              variant="document"
              value={watch("passport_back_url") || null}
              onUpload={async (file) => (await uploadFile(file, "customer", "passport_back")).url}
              onChange={(url) => setValue("passport_back_url", url ?? "")}
            />
          </Grid>

          {DOC_SLOTS.map((slot) => (
            <Grid key={slot} size={{ xs: 12, sm: 6 }}>
              <Stack spacing={1}>
                <Controller
                  name={`${slot}_label`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label={t("settings.documentLabel")}
                    />
                  )}
                />
                <FileUploadField
                  label={t("settings.documentFile")}
                  variant="document"
                  value={watch(`${slot}_url`) || null}
                  onUpload={async (file) => (await uploadFile(file, "customer", slot)).url}
                  onChange={(url) => setValue(`${slot}_url`, url ?? "")}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              </Stack>
            </Grid>
          ))}
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/crm/customers")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
