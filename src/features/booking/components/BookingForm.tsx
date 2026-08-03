// src/features/booking/components/BookingForm.tsx
import { Box, Grid, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
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
  defaultValues?: Partial<BookingFormInput>;
  onSubmit: (data: BookingFormInput) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
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

export default function BookingForm({ defaultValues, onSubmit, disabled = false, disabledReason }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getBookingSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
        <FormSection title={t("booking.sectionDetails")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="cust_uuid"
              label={t("common.customer")}
              control={control}
              dropdownName="customers"
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="enquiry_uuid"
              label={t("booking.enquiry")}
              control={control}
              dropdownName="enquiries"
              disabled={disabled}
              onOptionSelected={handleEnquirySelected}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete
              name="business_type"
              label={t("booking.businessType")}
              control={control}
              useForm={true}
              allowAdd={false}
              pagination
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="pkg_uuid"
              label={t("booking.package")}
              control={control}
              dropdownName="packages"
              disabled={disabled}
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="departure_uuid"
              label={t("booking.departure")}
              control={control}
              dropdownName="departures"
              disabled={disabled}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="booking_date"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("booking.bookingDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="travel_start_date"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("booking.travelStartDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="travel_end_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField {...field} type="date" label={t("booking.travelEndDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="currency_code" control={control} render={({ field, fieldState }) => (
              <TextField {...field} label={t("booking.currencyCode")} fullWidth disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
            )} />
          </Grid>

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
