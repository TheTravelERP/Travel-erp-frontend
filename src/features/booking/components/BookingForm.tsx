// src/features/booking/components/BookingForm.tsx
import { Box, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getBookingSchema } from "../booking.schema";
import type { BookingFormInput } from "../booking.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import FormSection from "../../../components/forms/FormSection";
import FormActions from "../../../components/forms/FormActions";
import { getEnquiryByUuid } from "../../enquiry/enquiry.api";

interface Props {
  defaultValues?: Partial<BookingFormInput> & {
    quotation_no?: string | null;
    service_types?: string[];
  };
  onSubmit: (data: BookingFormInput) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
  // Sales Context (Customer, Enquiry, Business Type, Package, Departure,
  // Currency) — a commitment made at the sales stage. Defaults to true so
  // BookingCreatePage (always pre-commit) needs no change.
  salesContextEditable?: boolean;
}

const emptyValues: BookingFormInput = {
  enquiry_uuid: null,
  cust_uuid: "",
  business_type: "",
  pkg_uuid: null,
  departure_uuid: null,
  agent_uuid: null,
  booking_date: new Date().toISOString().slice(0, 10),
  travel_start_date: "",
  travel_end_date: "",
  pax_adult: 1,
  pax_child: 0,
  pax_infant: 0,
  currency_code: "INR",
  reference: "",
  internal_notes: "",
  customer_notes: "",
};

export default function BookingForm({
  defaultValues,
  onSubmit,
  disabled = false,
  disabledReason,
  salesContextEditable = true,
}: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getBookingSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(schema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const businessType = useWatch({ control, name: "business_type" });
  const pkgUuid = useWatch({ control, name: "pkg_uuid" });
  const isPackageBooking = businessType === "Package";
  const salesContextDisabled = disabled || !salesContextEditable;

  // Business Type drives Travel Package's visibility — when it changes away
  // from "Package", clear pkg_uuid/departure_uuid AND any validation error
  // still attached to them immediately, not just their values. Skips the
  // very first render (loading defaultValues isn't a "change").
  const prevBusinessTypeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prev = prevBusinessTypeRef.current;
    prevBusinessTypeRef.current = businessType;
    if (prev === undefined || prev === businessType) return;
    if (businessType !== "Package") {
      setValue("pkg_uuid", null);
      setValue("departure_uuid", null);
      clearErrors(["pkg_uuid", "departure_uuid"]);
    }
  }, [businessType, setValue, clearErrors]);

  // Pre-fill business_type from the picked Enquiry — still editable
  // afterward, same convention as Quotation's own enquiry-driven pre-fill.
  async function handleEnquirySelected(option: any | null) {
    if (!option) return;
    try {
      const detail = await getEnquiryByUuid(option.value);
      setValue("business_type", detail.business_type, { shouldValidate: true });
    } catch {
      // Non-fatal — business_type just stays whatever the user had, and
      // remains directly editable below.
    }
  }

  const salesContextLockChip = !salesContextEditable ? (
    <Chip size="small" color="warning" label={t("booking.salesContextLocked")} />
  ) : undefined;

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
        <FormSection title={t("booking.sectionDetails")} titleAdornment={salesContextLockChip}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="cust_uuid"
              label={t("common.customer")}
              control={control}
              dropdownName="customers"
              disabled={salesContextDisabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="enquiry_uuid"
              label={t("booking.enquiry")}
              control={control}
              dropdownName="enquiries"
              disabled={salesContextDisabled}
              onOptionSelected={handleEnquirySelected}
            />
          </Grid>
          {defaultValues?.quotation_no && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("booking.quotation")}
                value={defaultValues.quotation_no}
                fullWidth
                disabled
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete
              name="business_type"
              label={t("booking.businessType")}
              control={control}
              useForm={true}
              allowAdd={false}
              pagination
              disabled={salesContextDisabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="agent_uuid"
              label={t("booking.salesExecutive")}
              control={control}
              dropdownName="users"
              disabled={disabled}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="booking_date"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("booking.bookingDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="travel_start_date"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("booking.travelStartDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="travel_end_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} type="date" label={t("booking.travelEndDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="currency_code" control={control} render={({ field, fieldState }) => (
              <TextField {...field} label={t("booking.currencyCode")} fullWidth disabled={salesContextDisabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
            )} />
          </Grid>

          {!!defaultValues?.service_types?.length && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("booking.services")}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {defaultValues.service_types.map((serviceType) => (
                  <Chip key={serviceType} size="small" label={serviceType} />
                ))}
              </Stack>
            </Grid>
          )}
        </FormSection>

        {isPackageBooking && (
          <FormSection title={t("booking.sectionTravelPackage")} titleAdornment={salesContextLockChip}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EntityAutocomplete
                name="pkg_uuid"
                label={t("booking.package")}
                control={control}
                dropdownName="packages"
                disabled={salesContextDisabled}
              />
            </Grid>
            {!!pkgUuid && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <EntityAutocomplete
                  name="departure_uuid"
                  label={t("booking.departure")}
                  control={control}
                  dropdownName="departures"
                  pkgUuid={pkgUuid}
                  disabled={salesContextDisabled}
                />
              </Grid>
            )}
          </FormSection>
        )}

        <FormSection title={t("booking.sectionPassengers")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="pax_adult" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("booking.paxAdult")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="pax_child" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("booking.paxChild")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="pax_infant" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("booking.paxInfant")} fullWidth disabled={disabled} />
            )} />
          </Grid>
        </FormSection>

        <FormSection title={t("common.notes")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="reference" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.reference")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="internal_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.internalNotes")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller name="customer_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("booking.customerNotes")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
        </FormSection>

        {!disabled && (
          <FormActions
            onBack={() => navigate("/app/bookings/list")}
            onDiscard={() => reset()}
            submitting={isSubmitting}
          />
        )}
      </Grid>
    </Box>
  );
}
