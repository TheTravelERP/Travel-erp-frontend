// src/features/booking/components/BookingForm.tsx
import { Box, Chip, Grid, Stack, TextField, Typography } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { EnquiryDetail } from "../../enquiry/enquiry.types";
import BookingCustomerPanel from "./quickResolve/BookingCustomerPanel";
import BookingPackagePanel from "./quickResolve/BookingPackagePanel";

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
  cust_uuid: null,
  business_type: "",
  pkg_uuid: null,
  pkg_count: 1,
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

  // Skips the very first run — useForm's own defaultValues initializer
  // already captured the correct values for the form's first render, so
  // re-running reset() again immediately after mount is pure redundancy in
  // every current call path (BookingCreatePage/BookingEditPage always pass
  // a stable defaultValues by the time BookingForm first renders).
  const isInitialDefaultValuesRef = useRef(true);
  useEffect(() => {
    const isInitial = isInitialDefaultValuesRef.current;
    isInitialDefaultValuesRef.current = false;
    if (defaultValues && !isInitial) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const businessType = useWatch({ control, name: "business_type" });
  const pkgUuid = useWatch({ control, name: "pkg_uuid" });
  const isPackageBooking = businessType === "Package";
  const salesContextDisabled = disabled || !salesContextEditable;

  /* ==========================================================
     ENQUIRY-DRIVEN CUSTOMER RESOLUTION — mirrors QuotationForm.tsx. Once an
     Enquiry is attached, it (not a separately-picked Customer) is the
     source of truth for who the booking is for — Customer and Enquiry are
     never simultaneously live input surfaces (see create_booking/
     update_booking on the backend, which ignore payload.cust_uuid whenever
     enquiry_id is set).
  ========================================================== */
  const enquiryUuid = useWatch({ control, name: "enquiry_uuid" });
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loadingEnquiry, setLoadingEnquiry] = useState(false);

  // Skips the business_type pre-fill on the very first render (loading an
  // already-set enquiry_uuid from defaultValues isn't a "change" — same
  // convention as prevBusinessTypeRef below) so opening an existing booking
  // never clobbers its own (possibly since-diverged) business_type.
  const isInitialEnquiryLoadRef = useRef(true);
  useEffect(() => {
    const isInitial = isInitialEnquiryLoadRef.current;
    isInitialEnquiryLoadRef.current = false;

    if (!enquiryUuid) {
      setEnquiry(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingEnquiry(true);
      try {
        const detail = await getEnquiryByUuid(enquiryUuid);
        if (cancelled) return;
        setEnquiry(detail);
        if (!isInitial) {
          setValue("business_type", detail.business_type, { shouldValidate: true });
          if (detail.pkg_uuid) {
            setValue("pkg_uuid", detail.pkg_uuid, { shouldValidate: true });
          }
          if (detail.cust_uuid) {
            setValue("cust_uuid", detail.cust_uuid, { shouldValidate: true });
          }
        }
      } catch {
        if (!cancelled) {
          setEnquiry(null);
          showSnackbar({ message: t("common.loadUnable"), severity: "error" });
        }
      } finally {
        if (!cancelled) setLoadingEnquiry(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryUuid]);

  // Direct Booking (no enquiry) — "resolved" once cust_uuid is a real link,
  // written directly by BookingCustomerPanel's EntityAutocomplete/Create-New
  // flow (never deferred/inline text). Gates Save exactly like Quotation's
  // own linksResolved, minus the Package leg (Booking's own
  // Package/Departure aren't inherited from the Enquiry).
  const custUuidWatched = useWatch({ control, name: "cust_uuid" });
  const customerResolved = enquiry ? !!enquiry.cust_uuid : !!custUuidWatched;

  // Mirrors QuotationForm.tsx's handleEnquiryLinkResolved — keeps the local
  // enquiry state and the form's own cust_uuid/pkg_uuid fields in sync the
  // moment BookingCustomerPanel/BookingPackagePanel link the Enquiry to a
  // real Customer/Package, without waiting for a full form submit.
  function handleEnquiryLinkResolved(updated: EnquiryDetail) {
    setEnquiry(updated);
    if (updated.cust_uuid) setValue("cust_uuid", updated.cust_uuid);
    if (updated.pkg_uuid) setValue("pkg_uuid", updated.pkg_uuid);
  }

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

      <Grid container spacing={1.5}>
        {/* Enquiry leads — Business Type and Package (below) are derived
            from it once attached, so the source field renders first; the
            Customer section (also enquiry-driven) follows the whole
            section rather than preceding it. */}
        <FormSection title={t("booking.sectionDetails")} titleAdornment={salesContextLockChip}>
          <Grid size={{ xs: 12, sm: 9 }}>
            <EntityAutocomplete
              name="enquiry_uuid"
              label={t("booking.enquiry")}
              control={control}
              dropdownName="enquiries"
              disabled={salesContextDisabled}
            />
            {enquiry?.cust_uuid && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {t("common.customer")}: {enquiry.customer_name || "—"}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="business_type"
              label={t("booking.businessType")}
              control={control}
              useForm={true}
              allowAdd={false}
              pagination
              disabled={salesContextDisabled || !!enquiry}
            />
            {!!enquiry && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {t("booking.businessTypeInheritedFromEnquiry")}
              </Typography>
            )}
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

        {/* Customer / Package resolution — same panels for Direct Booking
            (enquiry null) and Booking-from-Enquiry (enquiry set, snapshot
            card + pre-searched autocomplete). Mirrors QuotationForm.tsx's
            unified pattern. Customer stays left/md:6 whether or not
            Package renders, so its width never shifts. */}
        {!loadingEnquiry && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <BookingCustomerPanel
                control={control}
                setValue={setValue}
                enquiry={enquiry}
                onEnquiryUpdated={handleEnquiryLinkResolved}
                disabled={salesContextDisabled}
                salesContextLocked={!salesContextEditable}
              />
            </Grid>

            {isPackageBooking && (
              <Grid size={{ xs: 12, md: 6 }}>
                <BookingPackagePanel
                  control={control}
                  setValue={setValue}
                  enquiry={enquiry}
                  onEnquiryUpdated={handleEnquiryLinkResolved}
                  disabled={salesContextDisabled}
                  salesContextLocked={!salesContextEditable}
                />
              </Grid>
            )}
          </>
        )}

        {isPackageBooking && !!pkgUuid && (
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

        <FormSection title={t("booking.sectionPassengers")}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="pkg_count" control={control} render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label={t("booking.numberOfPackages")}
                fullWidth
                disabled={disabled}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="pax_adult" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("booking.paxAdult")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller name="pax_child" control={control} render={({ field }) => (
              <TextField {...field} type="number" label={t("booking.paxChild")} fullWidth disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
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
            saveDisabled={!customerResolved}
            saveDisabledReason={!customerResolved ? t("booking.waitingForCustomer") : undefined}
          />
        )}
      </Grid>
    </Box>
  );
}
