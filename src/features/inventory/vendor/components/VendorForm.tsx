// src/features/inventory/vendor/components/VendorForm.tsx

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
  physical_address: "",
  physical_city: "",
  physical_country_code: "",
  physical_state_province_code: "",
  physical_pincode: "",
  mailing_address: "",
  mailing_city: "",
  mailing_country_code: "",
  mailing_state_province_code: "",
  mailing_pincode: "",
  default_currency_code: "",
  payment_terms: "",
  bank_name: "",
  bank_branch: "",
  account_holder_name: "",
  account_number: "",
  account_type: "",
  ifsc_code: "",
  swift_code: "",
  remarks: "",
  status: "Active",
  is_active: true,
  contacts: [],
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

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "contacts",
  });

  const physicalCountryCode = watch("physical_country_code");
  const mailingCountryCode = watch("mailing_country_code");
  const [addPhysicalStateProvinceOpen, setAddPhysicalStateProvinceOpen] = useState(false);
  const [addMailingStateProvinceOpen, setAddMailingStateProvinceOpen] = useState(false);
  const [sameAsPhysical, setSameAsPhysical] = useState(false);

  function handleSameAsPhysicalToggle(checked: boolean) {
    setSameAsPhysical(checked);
    if (checked) {
      setValue("mailing_address", watch("physical_address"));
      setValue("mailing_city", watch("physical_city"));
      setValue("mailing_country_code", watch("physical_country_code"));
      setValue("mailing_state_province_code", watch("physical_state_province_code"));
      setValue("mailing_pincode", watch("physical_pincode"));
    }
  }

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

        {/* ---------- Physical Address ---------- */}
        <FormSection title={t("vendor.sectionPhysicalAddress")}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="physical_address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("vendor.address")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="physical_country_code"
              label={t("common.country")}
              control={control}
              dropdownName="country"
              onOptionSelected={() => setValue("physical_state_province_code", "")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="physical_state_province_code"
              label={t("location.stateProvince")}
              control={control}
              dropdownName="city"
              countryCode={physicalCountryCode || null}
              disabled={!physicalCountryCode}
              allowAdd
              onAddNew={() => setAddPhysicalStateProvinceOpen(true)}
            />
          </Grid>

          <AddStateProvinceDialog
            open={addPhysicalStateProvinceOpen}
            countryCode={physicalCountryCode || ""}
            onClose={() => setAddPhysicalStateProvinceOpen(false)}
            onCreated={(stateProvince) => {
              setValue("physical_state_province_code", stateProvince.city_code);
              setAddPhysicalStateProvinceOpen(false);
            }}
          />

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="physical_city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.city")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="physical_pincode"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.pincode")} fullWidth />}
            />
          </Grid>
        </FormSection>

        {/* ---------- Mailing Address ---------- */}
        <FormSection
          title={t("vendor.sectionMailingAddress")}
          titleAdornment={
            <FormControlLabel
              sx={{ ml: "auto" }}
              control={
                <Checkbox
                  checked={sameAsPhysical}
                  onChange={(e) => handleSameAsPhysicalToggle(e.target.checked)}
                />
              }
              label={t("vendor.sameAsPhysicalAddress")}
            />
          }
        >
          <Grid size={{ xs: 12 }}>
            <Controller
              name="mailing_address"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("vendor.address")} fullWidth multiline rows={2} disabled={sameAsPhysical} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="mailing_country_code"
              label={t("common.country")}
              control={control}
              dropdownName="country"
              disabled={sameAsPhysical}
              onOptionSelected={() => setValue("mailing_state_province_code", "")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="mailing_state_province_code"
              label={t("location.stateProvince")}
              control={control}
              dropdownName="city"
              countryCode={mailingCountryCode || null}
              disabled={sameAsPhysical || !mailingCountryCode}
              allowAdd
              onAddNew={() => setAddMailingStateProvinceOpen(true)}
            />
          </Grid>

          <AddStateProvinceDialog
            open={addMailingStateProvinceOpen}
            countryCode={mailingCountryCode || ""}
            onClose={() => setAddMailingStateProvinceOpen(false)}
            onCreated={(stateProvince) => {
              setValue("mailing_state_province_code", stateProvince.city_code);
              setAddMailingStateProvinceOpen(false);
            }}
          />

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="mailing_city"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.city")} fullWidth disabled={sameAsPhysical} />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="mailing_pincode"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.pincode")} fullWidth disabled={sameAsPhysical} />}
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

        {/* ---------- Banking / Payment ---------- */}
        <FormSection title={t("vendor.sectionBanking")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="bank_name"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.bankName")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="bank_branch"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.bankBranch")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="account_holder_name"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.accountHolderName")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="account_number"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.accountNumber")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="account_type"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t("vendor.accountType")} fullWidth>
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="Savings">{t("vendor.accountTypeSavings")}</MenuItem>
                  <MenuItem value="Current">{t("vendor.accountTypeCurrent")}</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="ifsc_code"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.ifscCode")} fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="swift_code"
              control={control}
              render={({ field }) => <TextField {...field} label={t("vendor.swiftCode")} fullWidth />}
            />
          </Grid>
        </FormSection>

        {/* ---------- Contacts ---------- */}
        <FormSection
          title={t("vendor.sectionContacts")}
          titleAdornment={
            <Box sx={{ ml: "auto" }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => appendContact({ contact_type: "", contact_name: "", phone: "", email: "" })}
              >
                {t("vendor.addContact")}
              </Button>
            </Box>
          }
        >
          {contactFields.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                {t("vendor.noContactsYet")}
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Stack spacing={2}>
              {contactFields.map((field, index) => (
                <Grid container spacing={2} key={field.id} alignItems="flex-start">
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <DropdownAutocomplete
                      name={`contacts.${index}.contact_type`}
                      dropdownName="vendor_contact_type"
                      label={t("vendor.contactType")}
                      control={control}
                      useForm
                      allowAdd={false}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Controller
                      name={`contacts.${index}.contact_name`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label={t("vendor.contactName")}
                          fullWidth
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <MobileNumberField name={`contacts.${index}.phone`} control={control} label={t("vendor.mobile")} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2.5 }}>
                    <Controller
                      name={`contacts.${index}.email`}
                      control={control}
                      render={({ field }) => <TextField {...field} label={t("vendor.email")} fullWidth />}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 0.5 }}>
                    <IconButton color="error" onClick={() => removeContact(index)} title={t("vendor.removeContact")}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Grid>
        </FormSection>

        {/* ---------- Additional Information ---------- */}
        <FormSection title={t("vendor.sectionAdditional")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="default_currency_code"
              label={t("vendor.defaultCurrency")}
              control={control}
              dropdownName="currency_master"
            />
          </Grid>

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
