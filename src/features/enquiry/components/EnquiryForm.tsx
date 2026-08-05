// src/features/enquiry/components/EnquiryForm.tsx

import {
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import GroupIcon from "@mui/icons-material/Group";
import { getEnquirySchema } from "../enquiry.schema";
import type { z } from "zod";
import CustomerSelector from "../../customer/components/CustomerSelector";
import PackageSelector from "../../package/components/PackageSelector";

export type EnquiryFormInput = z.infer<ReturnType<typeof getEnquirySchema>>;

import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import MobileNumberField from "../../../components/common/MobileNumberField";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import FormActions from "../../../components/forms/FormActions";
import FormSection from "../../../components/forms/FormSection";

interface EnquiryFormProps {
  defaultValues?: Partial<EnquiryFormInput>;
  onSubmit: (data: EnquiryFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues = {
  cust_uuid: null,
  customer_mode: "new" as const,
  customer_name: "",
  customer_mobile: "",
  customer_alternate_mobile: "",
  customer_email: "",
  business_type: "",
  pkg_uuid: null,
  package_mode: "custom" as const,
  package_name: "",
  lead_source: "",
  pax_count: 1,
  enquiry_priority: "",
  conversion_status: "Pending",
  description: "",
};

// customer_mode/package_mode are UI-only toggle state — the API response
// never carries them (only cust_uuid/pkg_uuid do), so mergeFormDefaults()
// always falls back to emptyValues' 'new'/'custom' for these two fields,
// regardless of whether a real link exists. Left alone, that fallback wins
// on every reset() — including the one below firing on mount, right after
// CustomerSelector/PackageSelector's own mount effect has (as a child, so
// it runs first) already set the correct derived mode — silently
// re-clobbering it back to 'new'/'custom' while the toggle UI still shows
// "Existing"/"Inventory" from its own untouched local state. That's exactly
// the shape of the "toggle looks right, Save still nulls the link" bug:
// always derive these two fields from cust_uuid/pkg_uuid at the one place
// merged defaults are computed, instead of leaving them to fall back or
// relying on a child component to fix them up after the fact.
function withDerivedModes(values: EnquiryFormInput): EnquiryFormInput {
  return {
    ...values,
    customer_mode: values.cust_uuid ? "existing" : "new",
    package_mode: values.pkg_uuid ? "existing" : "custom",
  };
}

export default function EnquiryForm({
  defaultValues,
  onSubmit,
  loading = false,
}: EnquiryFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const enquirySchema = useMemo(() => getEnquirySchema(t), [t]);

  /* ---------------- FORM ---------------- */
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: withDerivedModes(mergeFormDefaults(emptyValues, defaultValues)),
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (defaultValues) {
      reset(withDerivedModes(mergeFormDefaults(emptyValues, defaultValues)));
    }
  }, [defaultValues, reset]);

  // Package is only relevant when business_type === 'Package' — the
  // PackageSelector (and its custom/existing toggle) never renders for any
  // other business type, per the CRM/Booking architecture decision.
  const businessType = useWatch({ control, name: "business_type" });
  const isPackageBusiness = businessType === "Package";

  // Only the currently active side of each New/Existing-style toggle is ever submitted —
  // if "New"/"Custom" is active, a stale linked uuid left over from earlier toggling must
  // not be sent, even though the field itself is never cleared just from toggling.
  const submitActiveModes = ({
    customer_mode,
    package_mode,
    ...data
  }: EnquiryFormInput) => {
    const payload = { ...data };
    if (customer_mode === "new") {
      payload.cust_uuid = null;
    }
    if (package_mode === "custom") {
      payload.pkg_uuid = null;
    }
    if (payload.business_type !== "Package") {
      payload.pkg_uuid = null;
      payload.package_name = "";
    }
    return onSubmit(payload as EnquiryFormInput);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submitActiveModes, () =>
        showSnackbar({
          message: t("validation.fixHighlightedFields"),
          severity: "error",
        }),
      )}
      noValidate
      sx={{ flexGrow: 1 }}
    >
      <Grid container spacing={1.5}>
        <FormSection title={t("enquiry.enquiryContext")}>
          {/* First row */}
          <Grid size={{ xs: 12, md: 4 }}>
            <DropdownAutocomplete
              name="business_type"
              label={t("enquiry.businessType")}
              control={control}
              useForm
              allowAdd={false}
              pagination
            />
          </Grid>

          {/* Empty space to complete the first row */}
          <Grid size={{ md: 8 }} />

           {/* Second row */}
          <Grid size={{ xs: 12, md: 8 }}>
            <CustomerSelector
              control={control}
              setValue={setValue}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            {isPackageBusiness && (
              <PackageSelector
                control={control}
                setValue={setValue}
              />
            )}
          </Grid>
        </FormSection>

        {/* ENQUIRY DETAILS */}
        <FormSection title={t("enquiry.enquiryDetails")}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="pax_count"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("enquiry.paxCount")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      field.onChange(raw);
                      return;
                    }
                    const num = Number(raw);
                    field.onChange(
                      Number.isFinite(num) ? Math.min(num, 9999) : raw,
                    );
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="lead_source"
              label={t("common.source")}
              control={control}
              useForm={true}
              allowAdd={true}
              pagination
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="enquiry_priority"
              label={t("common.priority")}
              control={control}
              useForm={true}
              allowAdd={false}
              pagination
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <MobileNumberField
              name="customer_alternate_mobile"
              control={control}
              label={t("enquiry.alternateMobile")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("common.notes")}
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/enquiries")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
