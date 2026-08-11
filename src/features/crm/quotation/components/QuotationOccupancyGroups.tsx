// src/features/crm/quotation/components/QuotationOccupancyGroups.tsx
import { Alert, Box, Button, Grid, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Controller, useFieldArray, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import FormSection from "../../../../components/forms/FormSection";
import { resolvePackagePricing } from "../../../package/packagePricing/packagePricing.api";
import type { PackagePricingResolveResult } from "../../../package/packagePricing/packagePricing.types";
import type { QuotationFormInput } from "../quotation.types";
import { DISCOUNT_TYPES, calculateRowLineTotal, calculateSectionTotal } from "../pricing";
import CreatePackagePricingDialog from "./CreatePackagePricingDialog";

// LOCKED architecture: each row is exactly one pricing rule — Occupancy
// Type + Passenger Type + Quantity — resolved 1:1 against PackagePricing.
// No mixing of Adult/Child/Infant counts within a single row.
const emptyGroup = {
  occupancy_type: "",
  passenger_type: "",
  quantity: 1,
  selling_price: undefined,
  discount_type: "Percentage" as const,
  discount_value: 0,
};

// Fixed per-column min-widths for the Occupancy Pricing row — same
// horizontal-scroll pattern as QuotationForm.tsx's Service Lines rows (see
// the comment on SERVICE_LINE_COLUMN_WIDTHS there for why fixed widths +
// nowrap replace Grid's responsive sizing here).
const OCCUPANCY_COLUMN_WIDTHS = {
  occupancyType: 150,
  passengerType: 150,
  quantity: 90,
  packagePrice: 140,
  sellingPrice: 140,
  discountType: 150,
  discountValue: 120,
  finalPrice: 170,
  delete: 48,
} as const;

// Subtle, thin scrollbar for the horizontally-scrollable row area — no
// outer card/border, just enough affordance to show more content exists.
const SCROLLABLE_ROWS_SX = {
  overflowX: "auto",
  pb: 0.5,
  "&::-webkit-scrollbar": { height: 6 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "divider", borderRadius: 3 },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
} as const;

// Caps the "missing pricing" warning (which sits below a scrollable row) to
// a readable width instead of stretching to the row's full scrollable
// content width — see QuotationForm.tsx's ROW_EXPANSION_SX for the same
// reasoning.
const ROW_EXPANSION_SX = { maxWidth: "min(560px, 92vw)" } as const;

// LOCKED: the Quotation Header (pax_adult/pax_child/pax_infant) is the only
// source of truth for passenger counts. This list only drives the read-only
// allocation summary below — it never writes back to the header.
const PASSENGER_ALLOCATION_TYPES = [
  { type: "Adult", labelKey: "quotation.paxAdult" },
  { type: "Child", labelKey: "quotation.paxChild" },
  { type: "Infant", labelKey: "quotation.paxInfant" },
] as const;

interface QuotationOccupancyGroupsProps {
  control: Control<QuotationFormInput>;
  setValue: UseFormSetValue<QuotationFormInput>;
  packageUuid: string;
  packageCurrency: string;
  priceAsOfDate: string;
  disabled?: boolean;
  errorMessage?: string;
  paxAdult: number;
  paxChild: number;
  paxInfant: number;
}

type ResolutionState = PackagePricingResolveResult | "loading";

export default function QuotationOccupancyGroups({
  control,
  setValue,
  packageUuid,
  packageCurrency,
  priceAsOfDate,
  disabled,
  errorMessage,
  paxAdult,
  paxChild,
  paxInfant,
}: QuotationOccupancyGroupsProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: "occupancy_groups" });
  const groups = useWatch({ control, name: "occupancy_groups" }) ?? [];

  // Live allocation — recomputed on every render straight off the watched
  // occupancy_groups array, so it updates instantly with no Save required.
  // Purely a read-only reflection of Header vs. rows; never writes back.
  // Number(...) guards against the same raw-watched-string issue as
  // group.quantity below — pax_adult/pax_child/pax_infant can arrive here
  // as strings depending on which field last triggered a re-render.
  const headerCounts: Record<string, number> = {
    Adult: Number(paxAdult) || 0,
    Child: Number(paxChild) || 0,
    Infant: Number(paxInfant) || 0,
  };
  const allocatedCounts: Record<string, number> = { Adult: 0, Child: 0, Infant: 0 };
  for (const group of groups) {
    // useWatch returns raw, not-yet-zod-coerced form state — quantity can
    // still be a string here (e.g. "3"), and `+=` on a string silently does
    // concatenation ("0" + "3" -> "03") instead of addition. Number(...)
    // forces the arithmetic.
    if (group.passenger_type in allocatedCounts) {
      allocatedCounts[group.passenger_type] += Number(group.quantity) || 0;
    }
  }

  // Keyed by row index — one resolution per row, since a row is now exactly
  // one Occupancy Type + Passenger Type combination.
  const [resolutions, setResolutions] = useState<Record<number, ResolutionState>>({});
  const [dialogTarget, setDialogTarget] = useState<{ index: number; occupancyType: string; passengerType: string } | null>(null);

  // Sell Price defaults to (and stays in sync with) the row's resolved
  // Package Price until the user directly edits it — same "typing doesn't
  // erase what's already there, but auto-sync stops once the user has
  // acted" convention used by CustomerSelector/BookingForm elsewhere in
  // this app. A ref (not state) because it must never itself trigger a
  // re-render/effect loop. Discount Type/Value are downstream of Sell
  // Price now (unified pricing engine, see pricing.ts) and never touch it.
  const manuallyEditedRef = useRef<Record<number, boolean>>({});

  async function resolveOne(index: number, occupancyType: string, passengerType: string) {
    if (!occupancyType || !passengerType || !packageUuid) return;
    setResolutions((prev) => ({ ...prev, [index]: "loading" }));
    try {
      const result = await resolvePackagePricing({
        package_uuid: packageUuid,
        occupancy_type: occupancyType,
        passenger_type: passengerType,
        price_as_of_date: priceAsOfDate,
      });
      setResolutions((prev) => ({ ...prev, [index]: result }));
    } catch {
      setResolutions((prev) => ({ ...prev, [index]: { resolved: false } }));
    }
  }

  function packagePriceFor(index: number): number | null {
    const resolution = resolutions[index];
    if (!resolution || resolution === "loading" || !resolution.resolved || resolution.price === undefined) return null;
    return resolution.price;
  }

  function isMissingFor(index: number): boolean {
    const resolution = resolutions[index];
    return !!resolution && resolution !== "loading" && !resolution.resolved;
  }

  // resolveOne only ever fired from the Occupancy Type/Passenger Type
  // dropdowns' onChange — never for rows that already had both values set
  // when the form loaded (editing an existing quotation, or defaultValues
  // arriving async). Those rows would show "—" in Package Price forever
  // unless the user happened to re-touch a dropdown. Runs once per row the
  // first time it has both values but no resolution yet; deliberately
  // excludes `groups`/`resolutions` from deps (they change on every
  // keystroke) so this only re-fires when a row is added/removed or the
  // package itself changes, not on every render.
  //
  // A loaded row's Sell Price already reflects whatever was actually saved
  // (including any discount baked into it at submit time — see
  // submitCleaned in QuotationForm.tsx) and must never be silently
  // recomputed from today's master Package Price just because this
  // resolution happens to be landing for the first time. manuallyEditedRef
  // starts empty on every fresh mount, so without seeding it here the sync
  // effect right below would treat every freshly-loaded row as
  // "un-overridden" and stomp its real, already-saved price the instant
  // its resolution arrives.
  useEffect(() => {
    fields.forEach((_, index) => {
      const g = groups[index];
      if (g?.selling_price !== undefined && g?.selling_price !== null) {
        manuallyEditedRef.current[index] = true;
      }
      if (g?.occupancy_type && g?.passenger_type && !(index in resolutions)) {
        void resolveOne(index, g.occupancy_type, g.passenger_type);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, packageUuid]);

  // Keeps Sell Price synced to Package Price for every row the user hasn't
  // manually overridden — fires whenever a resolution lands, from whichever
  // trigger caused it (dropdown change or the pricing dialog creating what
  // was missing).
  useEffect(() => {
    fields.forEach((_, index) => {
      if (manuallyEditedRef.current[index]) return;
      const price = packagePriceFor(index);
      if (price === null) return;
      const current = groups[index]?.selling_price;
      if (current !== price) {
        setValue(`occupancy_groups.${index}.selling_price`, price, { shouldValidate: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolutions]);

  const occupancyTotal = calculateSectionTotal(groups);

  return (
    <FormSection title={t("quotation.occupancyGroups")}>
      {/* Compact horizontal allocation summary — no card/border, just an
          inline status row directly under the section header. */}
      <Grid size={{ xs: 12 }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          divider={<Typography color="text.disabled">•</Typography>}
        >
          {PASSENGER_ALLOCATION_TYPES.map(({ type, labelKey }) => {
            const header = headerCounts[type];
            const allocated = allocatedCounts[type];
            const complete = allocated === header;
            const exceeds = allocated > header;
            const color = complete ? "success.main" : exceeds ? "error.main" : "warning.main";
            const StatusIcon = complete ? CheckCircleIcon : exceeds ? ErrorOutlineIcon : WarningAmberIcon;
            return (
              <Stack direction="row" spacing={0.5} alignItems="center" key={type}>
                <StatusIcon fontSize="small" sx={{ color }} />
                <Typography variant="body2" fontWeight={600} sx={{ color }}>
                  {t(labelKey)} {allocated}/{header}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Grid>

      {errorMessage && (
        <Grid size={{ xs: 12 }}>
          <Typography color="error" variant="body2">{errorMessage}</Typography>
        </Grid>
      )}

      {fields.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ py: 0 }}>{t("quotation.noServiceLinesForPackage")}</Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        {/* Horizontally-scrollable row area — same pattern as
            QuotationForm.tsx's Service Lines rows (MUI's standard
            overflowX:auto, scoped to just this rows block so the page
            itself never scrolls sideways). Each row is a nowrap flex row of
            fixed-width columns (OCCUPANCY_COLUMN_WIDTHS) instead of a
            responsive Grid, so it stays one intact horizontal line at every
            viewport instead of wrapping. */}
        <Box sx={SCROLLABLE_ROWS_SX}>
          <Stack spacing={2} sx={{ minWidth: "fit-content" }}>
            {fields.map((field, index) => {
              const occupancyType = groups[index]?.occupancy_type;
              const passengerType = groups[index]?.passenger_type;
              const packagePrice = packagePriceFor(index);
              const missing = isMissingFor(index);
              const sellingPrice = groups[index]?.selling_price;
              const discountType = groups[index]?.discount_type ?? "Percentage";
              const discountValue = groups[index]?.discount_value ?? 0;
              const quantity = groups[index]?.quantity;
              const finalPrice = calculateRowLineTotal({
                selling_price: sellingPrice,
                discount_type: discountType,
                discount_value: discountValue,
                quantity,
              });
              const isOverridden =
                packagePrice !== null &&
                sellingPrice !== undefined &&
                Math.abs(sellingPrice - packagePrice) > 0.005;
              // Caps this row's Qty input at whatever's left of the Header's
              // count for this Passenger Type after every OTHER row of the
              // same Passenger Type is accounted for — e.g. Header
              // Children=4, another Child row already has Qty=2 -> this row's
              // cap is 2, not 4. Purely a native-input-level guard (no
              // visible hint); the real Save-blocking enforcement is still
              // the zod superRefine (exact-match) and the backend allocation
              // check.
              const allocatedByOtherRows = groups.reduce((sum, g, i) => {
                if (i === index || g.passenger_type !== passengerType) return sum;
                return sum + (Number(g.quantity) || 0);
              }, 0);
              const quantityMax =
                passengerType && passengerType in headerCounts
                  ? Math.max(0, headerCounts[passengerType] - allocatedByOtherRows)
                  : 999;

              return (
                <Box key={field.id}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: "nowrap" }}>
                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.occupancyType, flexShrink: 0 }}>
                    <Controller
                      name={`occupancy_groups.${index}.occupancy_type`}
                      control={control}
                      render={({ field: f }) => (
                        <DropdownAutocomplete
                          name={`occupancy_groups.${index}.occupancy_type`}
                          label={t("packagePricing.occupancyType")}
                          dropdownName="occupancy_type"
                          useForm={false}
                          allowAdd={false}
                          disabled={disabled}
                          value={f.value}
                          onChange={(value: string) => {
                            f.onChange(value);
                            if (passengerType) void resolveOne(index, value, passengerType);
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.passengerType, flexShrink: 0 }}>
                    <Controller
                      name={`occupancy_groups.${index}.passenger_type`}
                      control={control}
                      render={({ field: f }) => (
                        <DropdownAutocomplete
                          name={`occupancy_groups.${index}.passenger_type`}
                          label={t("packagePricing.passengerType")}
                          dropdownName="passenger_type"
                          useForm={false}
                          allowAdd={false}
                          disabled={disabled}
                          value={f.value}
                          onChange={(value: string) => {
                            f.onChange(value);
                            if (occupancyType) void resolveOne(index, occupancyType, value);
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.quantity, flexShrink: 0 }}>
                    <Controller
                      name={`occupancy_groups.${index}.quantity`}
                      control={control}
                      render={({ field: f, fieldState }) => (
                        <TextField
                          {...f}
                          type="number"
                          label={t("quotation.quantity")}
                          fullWidth
                          size="small"
                          disabled={disabled}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          slotProps={{ htmlInput: { min: 1, max: quantityMax } }}
                          onChange={(e) => {
                            // Hard clamp — the max attribute alone doesn't stop
                            // a user from typing digits past it, only from
                            // using the spinner/native validation. This makes
                            // it physically impossible to exceed the Header's
                            // count for this row's Passenger Type.
                            const raw = e.target.value;
                            if (raw === "") {
                              f.onChange(raw);
                              return;
                            }
                            const num = Number(raw);
                            f.onChange(Number.isNaN(num) ? raw : Math.min(num, quantityMax));
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.packagePrice, flexShrink: 0 }}>
                    <TextField
                      label={t("quotation.packagePrice")}
                      fullWidth
                      size="small"
                      disabled
                      value={packagePrice !== null ? `${packageCurrency} ${packagePrice.toLocaleString()}` : "—"}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.sellingPrice, flexShrink: 0 }}>
                    <Controller
                      name={`occupancy_groups.${index}.selling_price`}
                      control={control}
                      render={({ field: f, fieldState }) => (
                        <TextField
                          {...f}
                          value={f.value ?? ""}
                          type="number"
                          label={t("quotation.sellingPrice")}
                          fullWidth
                          size="small"
                          disabled={disabled}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            (isOverridden ? t("quotation.sellingPriceOverridden") : undefined)
                          }
                          slotProps={{ htmlInput: { min: 0 } }}
                          onChange={(e) => {
                            manuallyEditedRef.current[index] = true;
                            f.onChange(e);
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.discountType, flexShrink: 0 }}>
                    <Controller
                      name={`occupancy_groups.${index}.discount_type`}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          select
                          label={t("quotation.discountType")}
                          fullWidth
                          size="small"
                          disabled={disabled}
                        >
                          {DISCOUNT_TYPES.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {t(opt === "Percentage" ? "quotation.discountTypePercentage" : "quotation.discountTypeAmount")}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.discountValue, flexShrink: 0 }}>
                    <Controller
                      name={`occupancy_groups.${index}.discount_value`}
                      control={control}
                      render={({ field: f, fieldState }) => {
                        const discountMax = discountType === "Percentage" ? 100 : sellingPrice ?? Infinity;
                        return (
                          <TextField
                            {...f}
                            value={f.value ?? 0}
                            type="number"
                            label={t("quotation.discountAmount")}
                            fullWidth
                            size="small"
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            slotProps={{ htmlInput: { min: 0, max: discountMax === Infinity ? undefined : discountMax } }}
                            onChange={(e) => {
                              // Hard clamp — the max attribute alone doesn't stop
                              // a user from typing digits past it (only the
                              // spinner/native validation respects it). Mirrors
                              // the Qty field's clamp above.
                              const raw = e.target.value;
                              if (raw === "") {
                                f.onChange(raw);
                                return;
                              }
                              const num = Number(raw);
                              f.onChange(Number.isNaN(num) ? raw : Math.min(Math.max(num, 0), discountMax));
                            }}
                          />
                        );
                      }}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.finalPrice, flexShrink: 0 }}>
                    <TextField
                      label={t("quotation.finalPrice")}
                      fullWidth
                      size="small"
                      disabled
                      value={`${packageCurrency} ${finalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                    />
                  </Box>

                  <Box sx={{ width: OCCUPANCY_COLUMN_WIDTHS.delete, flexShrink: 0 }}>
                    {!disabled && (
                      <IconButton color="error" onClick={() => remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Stack>

                {missing && (
                  <Alert
                    severity="warning"
                    icon={<WarningAmberIcon fontSize="small" />}
                    sx={{ mt: 1, ...ROW_EXPANSION_SX }}
                    action={
                      !disabled && (
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          onClick={() =>
                            setDialogTarget({ index, occupancyType: occupancyType!, passengerType: passengerType! })
                          }
                        >
                          {t("quotation.createPricingButton")}
                        </Button>
                      )
                    }
                  >
                    {t("quotation.packagePricingMissingForTypes", { types: `${occupancyType} / ${passengerType}` })}
                  </Alert>
                )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Grid>

      {/* Left-aligned, directly below the last row — continues the list
          top-to-bottom instead of forcing a trip back to the section
          header for every addition. */}
      {!disabled && (
        <Grid size={{ xs: 12 }}>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => append({ ...emptyGroup })}>
            {t("quotation.addOccupancyGroup")}
          </Button>
        </Grid>
      )}

      {fields.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end">
            <Typography variant="subtitle1" fontWeight={600}>
              {t("quotation.occupancyTotal")}: {packageCurrency} {occupancyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Grid>
      )}

      {dialogTarget && (
        <CreatePackagePricingDialog
          open
          onClose={() => setDialogTarget(null)}
          packageUuid={packageUuid}
          packageCurrency={packageCurrency}
          priceAsOfDate={priceAsOfDate}
          initialOccupancyType={dialogTarget.occupancyType}
          initialPassengerType={dialogTarget.passengerType}
          onResolved={(_occupancyType, _passengerType, result) => {
            // A price that was previously entirely missing has just been
            // created — always adopt it as the Sell Price for this row,
            // regardless of any earlier manual override (there was nothing
            // valid to have overridden before now).
            manuallyEditedRef.current[dialogTarget.index] = false;
            setResolutions((prev) => ({ ...prev, [dialogTarget.index]: result }));
          }}
        />
      )}
    </FormSection>
  );
}
