// src/features/customer/components/CustomerForm.tsx
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { getCustomerSchema } from "../customer.schema";
import type { z } from "zod";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import FileUploadField from "../../../components/common/FileUploadField";
import { useNavigate } from "react-router-dom";
import { getCountries } from "../../../services/public.service";
import { uploadFile } from "../../../services/upload.service";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";

const DOC_SLOTS = ["doc1", "doc2", "doc3", "doc4"] as const;

interface Country {
  iso_code: string;
  label: string;
  phone_code: string;
  flag_url: string;
}

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
  passport_no: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_issue_country: "",
  email: "",
  mobile: "",
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

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCountryLoading(true);
        const res = await getCountries();
        setCountries(res.items || []);
      } finally {
        setCountryLoading(false);
      }
    })();
  }, []);

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
        {/* PERSONAL DETAILS */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("settings.personalDetails")}
            </Typography>

            <Grid container spacing={2}>
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
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("common.mobile")}
                      fullWidth
                      required
                      placeholder="+14155550100"
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message}
                    />
                  )}
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
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={countries}
                      loading={countryLoading}
                      value={countries.find((c) => c.label === field.value) || null}
                      isOptionEqualToValue={(option, value) => option.label === value?.label}
                      getOptionLabel={(option) => option?.label || ""}
                      onChange={(_, value) => field.onChange(value?.label || "")}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                          <Box
                            key={key}
                            component="li"
                            {...optionProps}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <img src={option.flag_url} width={20} alt="" />
                            {option.label}
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label={t("customer.nationality")} fullWidth />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* PASSPORT DETAILS */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("customer.passportDetails")}
            </Typography>

            <Grid container spacing={2}>
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
                <Controller
                  name="passport_issue_country"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={countries}
                      loading={countryLoading}
                      value={countries.find((c) => c.label === field.value) || null}
                      isOptionEqualToValue={(option, value) => option.label === value?.label}
                      getOptionLabel={(option) => option?.label || ""}
                      onChange={(_, value) => field.onChange(value?.label || "")}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                          <Box
                            key={key}
                            component="li"
                            {...optionProps}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <img src={option.flag_url} width={20} alt="" />
                            {option.label}
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("customer.passportIssueCountry")}
                          fullWidth
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* BUSINESS DETAILS */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("customer.businessDetails")}
            </Typography>

            <Grid container spacing={2}>
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
            </Grid>
          </Paper>
        </Grid>

        {/* DOCUMENTS */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t("customer.documents")}
            </Typography>

            <Grid container spacing={2}>
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
            </Grid>
          </Paper>
        </Grid>

        {/* ACTIONS */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => navigate("/app/crm/customers")}>
              {t("common.back")}
            </Button>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => reset()}
                size="large"
              >
                {t("common.discard")}
              </Button>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? t("common.saving") : t("common.save")}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
