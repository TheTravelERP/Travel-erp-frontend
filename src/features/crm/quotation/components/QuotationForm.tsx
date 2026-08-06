// src/features/crm/quotation/components/QuotationForm.tsx
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { getQuotationSchema } from "../quotation.schema";
import type { QuotationFormInput } from "../quotation.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";
import { getEnquiryByUuid } from "../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../enquiry/enquiry.types";
import EnquirySummaryBar from "./EnquirySummaryBar";
import QuotationCustomerPanel from "./quickResolve/QuotationCustomerPanel";
import QuotationPackagePanel from "./quickResolve/QuotationPackagePanel";
import QuotationOccupancyGroups from "./QuotationOccupancyGroups";
import { getPackageByUuid } from "../../../package/package.api";

// Enquiries whose conversion_status leaves them effectively closed — flagged
// (not hidden) in the standalone picker so a user can still knowingly pick one.
const CLOSED_ENQUIRY_STATUSES = ["Lost", "Converted"];

// Document Type Master's stable code for Quotation (see
// app/seeds/system/document_type_data.py on the backend) — scopes the
// Terms & Conditions template picker to Quotation-tagged templates only.
const TERMS_DOCUMENT_TYPE_CODE = "QTN";

interface Props {
  /** "fromEnquiry": enquiry arrives pre-filled/locked via enquiryUuid (no dropdown).
   *  "standalone" (default): enquiry is picked via an EntityAutocomplete dropdown. */
  mode?: "standalone" | "fromEnquiry";
  enquiryUuid?: string;
  defaultValues?: Partial<QuotationFormInput>;
  onSubmit: (data: QuotationFormInput) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}

const emptyValues: QuotationFormInput = {
  enquiry_uuid: "",
  cust_uuid: null,
  business_type: "",
  pkg_uuid: null,
  pkg_count: 1,
  quotation_date: new Date().toISOString().slice(0, 10),
  valid_until: "",
  travel_date_from: "",
  travel_date_to: "",
  pax_adult: 1,
  pax_child: 0,
  pax_infant: 0,
  currency_code: "INR",
  terms_conditions: "",
  internal_notes: "",
  customer_notes: "",
  service_lines: [],
  occupancy_groups: [],
};

const emptyLine = {
  service_type: "Hotel",
  vendor_uuid: null,
  description: "",
  quantity: 1,
  cost_price: 0,
  selling_price: 0,
  discount_percent: 0,
};

// UTC-based so a "days" offset from a YYYY-MM-DD string can't drift by a day
// depending on the browser's local timezone (new Date("2026-08-02") plus
// local-time setDate() is a classic off-by-one-day trap).
function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function QuotationForm({
  mode = "standalone",
  enquiryUuid,
  defaultValues,
  onSubmit,
  disabled = false,
  disabledReason,
}: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Mirrors business_type === "Package" into the zod schema options — kept
  // as its own state (rather than derived inline) because computing it
  // requires watching fields off `control`, which doesn't exist until after
  // this schema/useForm call — it settles one render after the watch below.
  const [isPackageBusinessFlag, setIsPackageBusinessFlag] = useState(false);
  const schema = useMemo(
    () => getQuotationSchema(t, { isPackageBusiness: isPackageBusinessFlag }),
    [t, isPackageBusinessFlag],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<QuotationFormInput>({
    resolver: zodResolver(schema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "service_lines" });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  // "Valid For" (days) is a pure UI convenience — not part of the submitted
  // payload — that auto-fills valid_until as quotation_date + N days.
  // valid_until itself stays a normal editable field; typing into it directly
  // doesn't get overwritten unless quotation_date or validForDays changes again.
  const [validForDays, setValidForDays] = useState<string>("");
  const [validForDaysError, setValidForDaysError] = useState<string | undefined>();
  const quotationDateWatched = useWatch({ control, name: "quotation_date" });
  const travelDateFromWatched = useWatch({ control, name: "travel_date_from" });

  useEffect(() => {
    const raw = validForDays.trim();
    if (!raw) {
      setValidForDaysError(undefined);
      return;
    }
    const days = Number(raw);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      setValidForDaysError(t("quotation.validation.validForDaysRange"));
      return;
    }
    setValidForDaysError(undefined);
    const base = quotationDateWatched || new Date().toISOString().slice(0, 10);
    setValue("valid_until", addDaysToDateString(base, days), { shouldDirty: true, shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validForDays, quotationDateWatched]);

  // "Duration (Days)" mirrors "Valid For" above — a pure UI convenience that
  // auto-fills travel_date_to as travel_date_from + N days. Only fires once
  // a travel_date_from is set; travel_date_to stays independently editable.
  const [travelDurationDays, setTravelDurationDays] = useState<string>("");
  const [travelDurationDaysError, setTravelDurationDaysError] = useState<string | undefined>();

  useEffect(() => {
    const raw = travelDurationDays.trim();
    if (!raw) {
      setTravelDurationDaysError(undefined);
      return;
    }
    const days = Number(raw);
    if (!Number.isInteger(days) || days < 1) {
      setTravelDurationDaysError(t("quotation.validation.travelDurationDaysPositive"));
      return;
    }
    if (!travelDateFromWatched) {
      setTravelDurationDaysError(undefined);
      return;
    }
    setTravelDurationDaysError(undefined);
    setValue("travel_date_to", addDaysToDateString(travelDateFromWatched, days), {
      shouldDirty: true,
      shouldValidate: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelDurationDays, travelDateFromWatched]);

  // Terms & Conditions template picker — also a pure UI convenience, not
  // submitted itself. Selecting a template copies its terms_text into the
  // editable terms_conditions field below; from that point on it's just
  // free text like before, and only that text (the snapshot) gets saved
  // with the quotation. Editing the master later never touches this.
  const [selectedTermsTemplate, setSelectedTermsTemplate] = useState<string | null>(null);

  function handleTermsTemplateSelected(option: any | null) {
    setSelectedTermsTemplate(option?.value ?? null);
    if (option && typeof option.terms_text === "string") {
      setValue("terms_conditions", option.terms_text, { shouldDirty: true, shouldValidate: true });
    }
  }

  const linesError =
    errors.service_lines && !Array.isArray(errors.service_lines)
      ? // The whole-array error (service_lines.min(1)) lands directly on
        // `.message` on a fresh form, but under `.root.message` once the
        // field array has been actively manipulated via useFieldArray's
        // append/remove (e.g. editing an existing quotation down to zero
        // lines) — react-hook-form's resolver shapes it differently
        // depending on that interaction history. Check both.
        (errors.service_lines as any)?.message ?? (errors.service_lines as any)?.root?.message
      : undefined;

  const occupancyGroupsError =
    errors.occupancy_groups && !Array.isArray(errors.occupancy_groups)
      ? (errors.occupancy_groups as any)?.message ?? (errors.occupancy_groups as any)?.root?.message
      : undefined;

  /* ==========================================================
     RESOLVE-REQUIRED-LINKS — the enquiry a Quotation is built from may
     only carry snapshot customer/package data (leads shouldn't pollute
     the master tables). A single `enquiry` object is the source of truth
     here: customerResolved/packageResolved derive from its cust_uuid/
     pkg_uuid on every render, so linking/creating either master record
     (via QuotationCustomerPanel/QuotationPackagePanel below) just needs to
     patch this state locally to unlock Save/Service Lines, with no re-fetch.
  ========================================================== */
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loadingEnquiry, setLoadingEnquiry] = useState<boolean>(
    mode === "fromEnquiry" || (mode !== "fromEnquiry" && !!defaultValues?.enquiry_uuid),
  );

  const businessType = useWatch({ control, name: "business_type" });
  const isPackageBusiness = businessType === "Package";

  useEffect(() => {
    setIsPackageBusinessFlag(isPackageBusiness);
    // Occupancy Groups only exists in the form's live tree while Package is
    // selected — its Controller-bound fields unmount without clearing their
    // RHF values, leaving stale (now-invalid) entries behind that fail the
    // per-item occupancy_type/passenger_type required checks silently, since
    // the section that would surface the error is itself hidden.
    if (!isPackageBusiness) {
      setValue("occupancy_groups", []);
    }
  }, [isPackageBusiness, setValue]);

  const custUuidWatched = useWatch({ control, name: "cust_uuid" });
  const pkgUuidWatched = useWatch({ control, name: "pkg_uuid" });
  // Header — the only source of truth for passenger counts (see
  // QuotationOccupancyGroups.tsx's Passenger Allocation summary, which
  // reads these but never writes back to them).
  const paxAdultWatched = useWatch({ control, name: "pax_adult" });
  const paxChildWatched = useWatch({ control, name: "pax_child" });
  const paxInfantWatched = useWatch({ control, name: "pax_infant" });

  /* ==========================================================
     PACKAGE CURRENCY — QuotationOccupancyGroups (always shown for Package,
     alongside Service Lines) needs the selected Package's currency_code for
     display; fetched once per package selection.
  ========================================================== */
  const [packageCurrency, setPackageCurrency] = useState<string | null>(null);

  useEffect(() => {
    if (!isPackageBusiness || !pkgUuidWatched) {
      setPackageCurrency(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pkg = await getPackageByUuid(pkgUuidWatched);
        if (cancelled) return;
        setPackageCurrency(pkg.currency_code);
      } catch {
        if (!cancelled) setPackageCurrency(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPackageBusiness, pkgUuidWatched]);

  const priceAsOfDate = travelDateFromWatched || quotationDateWatched || new Date().toISOString().slice(0, 10);

  // Checked against *either* the enquiry's own link (the create-time
  // resolution signal) *or* the quotation's own already-set field (the
  // source of truth once a quotation exists — e.g. editing a Direct
  // Quotation, whose auto-created bookkeeping enquiry never gets its own
  // cust/pkg link filled in even though the quotation's fields are valid).
  // Either one being set is enough; neither is clobbered by the other's
  // absence.
  const customerResolved = enquiry ? !!enquiry.cust_uuid || !!custUuidWatched : !!custUuidWatched;
  // Package resolution only applies when business_type is "Package" — for
  // every other business_type, or when there's no enquiry at all (Direct
  // Quotation), it's a non-issue.
  const packageResolved = !isPackageBusiness || !!pkgUuidWatched || (!!enquiry && !!enquiry.pkg_uuid);
  const linksResolved = customerResolved && packageResolved;

  // Plain-language list of what's still blocking Save — shown next to the
  // Save button and in place of the Service Lines section, so the user
  // never has to guess why they can't submit yet.
  const missingReadinessItems = [
    !customerResolved && t("quotation.customerSectionTitle"),
    !packageResolved && t("quotation.packageSectionTitle"),
  ].filter(Boolean) as string[];

  // Covers both "fromEnquiry" (fresh create, enquiry supplied via URL) and
  // the edit-mode case (standalone mode, but defaultValues.enquiry_uuid is
  // already set from the quotation being edited) — both just need the full
  // EnquiryDetail loaded once. Only the fromEnquiry (fresh-create) branch
  // pushes the enquiry's pkg_uuid onto the form — in edit mode the
  // quotation's own already-loaded pkg_uuid (from defaultValues) is the
  // authoritative value and must not be clobbered by the enquiry's.
  useEffect(() => {
    const targetUuid = mode === "fromEnquiry" ? enquiryUuid : defaultValues?.enquiry_uuid;
    if (!targetUuid) return;
    let cancelled = false;

    (async () => {
      setLoadingEnquiry(true);
      try {
        const detail = await getEnquiryByUuid(targetUuid);
        if (cancelled) return;
        setEnquiry(detail);
        if (mode === "fromEnquiry") {
          setValue("enquiry_uuid", targetUuid);
          setValue("business_type", detail.business_type);
          if (detail.pkg_uuid) setValue("pkg_uuid", detail.pkg_uuid);
          if (detail.cust_uuid) setValue("cust_uuid", detail.cust_uuid);
        }
      } catch {
        if (!cancelled) showSnackbar({ message: t("common.loadUnable"), severity: "error" });
      } finally {
        if (!cancelled) setLoadingEnquiry(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, enquiryUuid, defaultValues?.enquiry_uuid]);

  async function handleEnquirySelected(option: any | null) {
    if (!option) {
      setEnquiry(null);
      return;
    }
    try {
      const detail = await getEnquiryByUuid(option.value);
      setEnquiry(detail);
      setValue("business_type", detail.business_type);
      if (detail.pkg_uuid) setValue("pkg_uuid", detail.pkg_uuid);
      if (detail.cust_uuid) setValue("cust_uuid", detail.cust_uuid);
    } catch {
      setEnquiry(null);
      showSnackbar({ message: t("common.loadUnable"), severity: "error" });
    }
  }

  function handleEnquiryLinkResolved(updated: EnquiryDetail) {
    setEnquiry(updated);
    if (updated.pkg_uuid) setValue("pkg_uuid", updated.pkg_uuid);
    if (updated.cust_uuid) setValue("cust_uuid", updated.cust_uuid);
  }

  // pkg_uuid only means anything for business_type "Package". cust_uuid is
  // only meaningful for Direct Quotation — once an Enquiry is attached, the
  // backend resolves the customer via the already-linked Enquiry instead.
  const submitCleaned = (data: QuotationFormInput) => {
    const payload = { ...data };
    if (!isPackageBusiness) {
      payload.pkg_uuid = null;
    }
    if (!isPackageBusiness) {
      payload.occupancy_groups = [];
    }
    if (payload.enquiry_uuid) {
      payload.cust_uuid = null;
    }
    return onSubmit(payload);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submitCleaned, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      {disabled && disabledReason && (
        <Box mb={2}>
          <Typography variant="body2" color="warning.main">{disabledReason}</Typography>
        </Box>
      )}

      {enquiry && <EnquirySummaryBar enquiry={enquiry} />}

      <Grid container spacing={1.5}>
        {/* Sales Context leads the form — Enquiry, Business Type, and
            Package (conditional) establish what's being sold before the
            Customer section (below) asks who it's for. Customer and
            Business Type/Package are derived from Enquiry once attached,
            so the source fields render first regardless of mode. */}
        <FormSection title={t("quotation.sectionSalesContext")}>
          {!!enquiry && (
            <Grid size={{ xs: 12 }}>
              <Alert
                severity="info"
                sx={{
                  py: 0,
                  px: 1,
                  minHeight: 0,
                  fontSize: "0.75rem",
                  alignItems: "center",
                  "& .MuiAlert-icon": { fontSize: "1rem", py: 0, mr: 0.75 },
                  "& .MuiAlert-message": { py: 0.5 },
                }}
              >
                {t("quotation.inheritedFromEnquiryAlert")}
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 9 }}>
            {mode === "fromEnquiry" ? (
              <TextField
                label={t("quotation.enquiry")}
                value={
                  loadingEnquiry
                    ? t("common.loading")
                    : enquiry
                    ? (enquiry.customer_name
                        ? `${enquiry.enquiry_no} — ${enquiry.customer_name}`.trim()
                        : enquiry.enquiry_no)
                    : ""
                }
                fullWidth
                disabled
              />
            ) : (
              <>
                <EntityAutocomplete
                  name="enquiry_uuid"
                  label={t("quotation.enquiry")}
                  control={control}
                  dropdownName="enquiries"
                  disabled={disabled}
                  onOptionSelected={handleEnquirySelected}
                  renderOption={(liProps, option: any) => {
                    const { key, ...optionProps } = liProps as any;
                    return (
                      <Box
                        key={key}
                        component="li"
                        {...optionProps}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <span>{option.label}</span>
                        {CLOSED_ENQUIRY_STATUSES.includes(option.conversion_status) && (
                          <DropdownColorChip dropdownName="enquiry_status" value={option.conversion_status} />
                        )}
                      </Box>
                    );
                  }}
                />
                {enquiry && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {t("quotation.enquirySummary", {
                      customer: enquiry.customer_name || "—",
                      package: enquiry.package_name || "—",
                      pax: enquiry.pax_count ?? "—",
                    })}
                  </Typography>
                )}
              </>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="business_type"
              label={t("quotation.businessType")}
              control={control}
              useForm={true}
              allowAdd={false}
              pagination
              disabled={disabled || !!enquiry}
            />
          </Grid>

        </FormSection>

        {/* Customer / Package resolution — same panels for Direct Quotation
            (enquiry null) and Quotation-from-Enquiry (enquiry set, snapshot
            card + pre-searched autocomplete). Customer stays left/md:6
            whether or not Package renders, so its width never shifts. */}
        {!loadingEnquiry && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <QuotationCustomerPanel
                control={control}
                setValue={setValue}
                enquiry={enquiry}
                onEnquiryUpdated={handleEnquiryLinkResolved}
                disabled={disabled}
              />
            </Grid>

            {isPackageBusiness && (
              <Grid size={{ xs: 12, md: 6 }}>
                <QuotationPackagePanel
                  control={control}
                  setValue={setValue}
                  enquiry={enquiry}
                  onEnquiryUpdated={handleEnquiryLinkResolved}
                  disabled={disabled}
                />
              </Grid>
            )}
          </>
        )}

        <FormSection title={t("quotation.sectionDetails")}>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="quotation_date"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label={t("quotation.quotationDate")} fullWidth disabled={disabled} slotProps={{ inputLabel: { shrink: true } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              type="number"
              label={t("quotation.validFor")}
              value={validForDays}
              onChange={(e) => setValidForDays(e.target.value)}
              disabled={disabled}
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 365 } }}
              error={!!validForDaysError}
              helperText={validForDaysError}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="valid_until"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("quotation.validUntil")}
                  fullWidth
                  disabled={disabled}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: quotationDateWatched || undefined },
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="travel_date_from"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("quotation.travelDateFrom")}
                  fullWidth
                  disabled={disabled}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: quotationDateWatched || undefined },
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              type="number"
              label={t("quotation.travelDurationDays")}
              value={travelDurationDays}
              onChange={(e) => setTravelDurationDays(e.target.value)}
              disabled={disabled}
              fullWidth
              slotProps={{ htmlInput: { min: 1 } }}
              error={!!travelDurationDaysError}
              helperText={travelDurationDaysError}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="travel_date_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("quotation.travelDateTo")}
                  fullWidth
                  disabled={disabled}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: travelDateFromWatched || undefined },
                  }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller name="pkg_count" control={control} render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label={t("quotation.numberOfPackages")}
                fullWidth
                disabled={disabled}
                slotProps={{ htmlInput: { min: 1, max: 999 } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller name="pax_adult" control={control} render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label={t("quotation.paxAdult")}
                fullWidth
                disabled={disabled}
                slotProps={{ htmlInput: { min: 1, max: 999 } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller name="pax_child" control={control} render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label={t("quotation.paxChild")}
                fullWidth
                disabled={disabled}
                slotProps={{ htmlInput: { min: 0, max: 999 } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller name="pax_infant" control={control} render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label={t("quotation.paxInfant")}
                fullWidth
                disabled={disabled}
                slotProps={{ htmlInput: { min: 0, max: 999 } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              label={t("quotation.paxCount")}
              value={(Number(paxAdultWatched) || 0) + (Number(paxChildWatched) || 0) + (Number(paxInfantWatched) || 0)}
              fullWidth
              disabled
              slotProps={{ htmlInput: { readOnly: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller name="currency_code" control={control} render={({ field, fieldState }) => (
              <TextField {...field} label={t("quotation.currencyCode")} fullWidth disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
            )} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="terms_condition_template"
              label={t("quotation.termsTemplate")}
              dropdownName="terms_condition"
              documentTypeCode={TERMS_DOCUMENT_TYPE_CODE}
              useForm={false}
              value={selectedTermsTemplate}
              onChange={setSelectedTermsTemplate}
              onOptionSelected={handleTermsTemplateSelected}
              disabled={disabled}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="terms_conditions" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.termsConditions")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="internal_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.internalNotes")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller name="customer_notes" control={control} render={({ field }) => (
              <TextField {...field} label={t("quotation.customerNotes")} fullWidth multiline minRows={2} disabled={disabled} />
            )} />
          </Grid>
        </FormSection>

        {!linksResolved ? (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              <Typography variant="body2" fontWeight={600}>
                {t("quotation.waitingFor")}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {missingReadinessItems.map((item) => (
                  <Typography key={item} component="li" variant="body2">
                    {item}
                  </Typography>
                ))}
              </Box>
            </Alert>
          </Grid>
        ) : (
          <>
            {/* Package: Occupancy is mandatory and Service Lines is optional
                (for extras beyond the package) — both render together, in
                that order. Every other business type shows Service Lines
                only, with its original min(1) requirement. */}
            {isPackageBusiness && (
              <QuotationOccupancyGroups
                control={control}
                setValue={setValue}
                packageUuid={pkgUuidWatched!}
                packageCurrency={packageCurrency ?? ""}
                priceAsOfDate={priceAsOfDate}
                disabled={disabled}
                errorMessage={occupancyGroupsError}
                paxAdult={paxAdultWatched ?? 0}
                paxChild={paxChildWatched ?? 0}
                paxInfant={paxInfantWatched ?? 0}
              />
            )}

            <FormSection
              title={t("quotation.serviceLines")}
              titleAdornment={
                !disabled && (
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => append({ ...emptyLine })} sx={{ ml: 2 }}>
                    {t("quotation.addLine")}
                  </Button>
                )
              }
            >
              {linesError && (
                <Grid size={{ xs: 12 }}>
                  <Typography color="error" variant="body2">{linesError}</Typography>
                </Grid>
              )}

              {fields.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">{t("quotation.noLinesYet")}</Typography>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Stack spacing={2}>
                  {fields.map((field, index) => (
                    <Grid container spacing={1.5} key={field.id} alignItems="center">
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <DropdownAutocomplete
                          name={`service_lines.${index}.service_type`}
                          label={t("quotation.serviceType")}
                          control={control}
                          dropdownName="quotation_service_type"
                          useForm={true}
                          allowAdd={false}
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Controller
                          name={`service_lines.${index}.description`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField {...f} label={t("quotation.description")} fullWidth disabled={disabled} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 1.2 }}>
                        <Controller
                          name={`service_lines.${index}.quantity`}
                          control={control}
                          render={({ field: f, fieldState }) => (
                            <TextField {...f} type="number" label={t("quotation.quantity")} fullWidth disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 1.4 }}>
                        <Controller
                          name={`service_lines.${index}.cost_price`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField {...f} type="number" label={t("quotation.costPrice")} fullWidth disabled={disabled} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 1.4 }}>
                        <Controller
                          name={`service_lines.${index}.selling_price`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField {...f} type="number" label={t("quotation.sellingPrice")} fullWidth disabled={disabled} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 1.4 }}>
                        <Controller
                          name={`service_lines.${index}.discount_percent`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField {...f} type="number" label={t("quotation.discountPercent")} fullWidth disabled={disabled} />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1.6 }}>
                        <EntityAutocomplete
                          name={`service_lines.${index}.vendor_uuid`}
                          label={t("quotation.vendor")}
                          control={control}
                          dropdownName="vendors"
                          disabled={disabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 0.4 }}>
                        {!disabled && (
                          <IconButton color="error" onClick={() => remove(index)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
              </Grid>
            </FormSection>
          </>
        )}

        {!disabled && (
          <FormActions
            onBack={() => navigate("/app/crm/quotations")}
            onDiscard={() => reset()}
            submitting={isSubmitting}
            saveDisabled={!linksResolved}
            saveDisabledReason={
              missingReadinessItems.length > 0
                ? `${t("quotation.waitingFor")} ${missingReadinessItems.join(", ")}`
                : undefined
            }
          />
        )}
      </Grid>
    </Box>
  );
}
