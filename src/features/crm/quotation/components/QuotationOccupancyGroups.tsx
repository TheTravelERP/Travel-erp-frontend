// src/features/crm/quotation/components/QuotationOccupancyGroups.tsx
import { Alert, Box, Button, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
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
import CreatePackagePricingDialog from "./CreatePackagePricingDialog";

// LOCKED architecture: each row is exactly one pricing rule — Occupancy
// Type + Passenger Type + Quantity — resolved 1:1 against PackagePricing.
// No mixing of Adult/Child/Infant counts within a single row.
const emptyGroup = { occupancy_type: "", passenger_type: "", quantity: 1, selling_price: undefined };

// LOCKED: the Quotation Header (pax_adult/pax_child/pax_infant) is the only
// source of truth for passenger counts. This list only drives the read-only
// Passenger Allocation summary below — it never writes back to the header.
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
  // Package Price until the user directly edits it (via Sell Price or
  // Discount) — same "toggling/typing doesn't erase what's already there,
  // but auto-sync stops once the user has acted" convention used by
  // CustomerSelector/BookingForm elsewhere in this app. A ref (not state)
  // because it must never itself trigger a re-render/effect loop.
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

  const grandTotal = fields.reduce((sum, _, index) => {
    const sellingPrice = groups[index]?.selling_price;
    const quantity = groups[index]?.quantity ?? 0;
    return sellingPrice !== undefined ? sum + sellingPrice * quantity : sum;
  }, 0);

  return (
    <FormSection
      title={t("quotation.occupancyGroups")}
      titleAdornment={
        !disabled && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => append({ ...emptyGroup })}
            sx={{ ml: 2 }}
          >
            {t("quotation.addOccupancyGroup")}
          </Button>
        )
      }
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="body2" color="text.secondary">
          {t("quotation.noServiceLinesForPackage")}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("quotation.passengerAllocation")}
          </Typography>
          <Grid container spacing={2}>
            {PASSENGER_ALLOCATION_TYPES.map(({ type, labelKey }) => {
              const header = headerCounts[type];
              const allocated = allocatedCounts[type];
              const complete = allocated === header;
              const exceeds = allocated > header;
              return (
                <Grid size={{ xs: 12, sm: 4 }} key={type}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {complete ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : exceeds ? (
                      <ErrorOutlineIcon color="error" fontSize="small" />
                    ) : (
                      <WarningAmberIcon color="warning" fontSize="small" />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {t(labelKey)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={complete ? "success.main" : exceeds ? "error.main" : "warning.main"}
                      >
                        {t("quotation.allocated")} {allocated} / {header}
                        {complete && ` — ${t("quotation.allocationComplete")}`}
                        {exceeds && ` — ${t("quotation.allocationExceedsQuantity", { type })}`}
                        {!complete && !exceeds && ` — ${t("quotation.allocationIncomplete", { count: header - allocated, type })}`}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Grid>

      {errorMessage && (
        <Grid size={{ xs: 12 }}>
          <Typography color="error" variant="body2">{errorMessage}</Typography>
        </Grid>
      )}

      {fields.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">{t("quotation.noOccupancyGroupsYet")}</Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Stack spacing={2}>
          {fields.map((field, index) => {
            const occupancyType = groups[index]?.occupancy_type;
            const passengerType = groups[index]?.passenger_type;
            const quantity = groups[index]?.quantity ?? 0;
            const packagePrice = packagePriceFor(index);
            const missing = isMissingFor(index);
            const sellingPrice = groups[index]?.selling_price;
            const finalAmount = sellingPrice !== undefined ? sellingPrice * quantity : undefined;
            const isOverridden =
              packagePrice !== null &&
              sellingPrice !== undefined &&
              Math.abs(sellingPrice - packagePrice) > 0.005;
            const discountAmount =
              packagePrice !== null && sellingPrice !== undefined ? packagePrice - sellingPrice : undefined;
            // Caps this row's Qty input at the Header's count for the
            // selected Passenger Type — e.g. Header Adults = 3 means no
            // single row can type more than 3. Purely a native-input-level
            // cap; the real Save-blocking enforcement is still the zod
            // superRefine (exact-match) and the backend allocation check.
            const quantityMax = passengerType && passengerType in headerCounts ? headerCounts[passengerType] : 999;

            return (
              <Box key={field.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="flex-start">
                  <Grid size={{ xs: 6, sm: 2 }}>
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
                  </Grid>

                  <Grid size={{ xs: 6, sm: 2 }}>
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
                  </Grid>

                  <Grid size={{ xs: 4, sm: 1 }}>
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
                  </Grid>

                  <Grid size={{ xs: 4, sm: 1.6 }}>
                    <TextField
                      label={t("quotation.packagePrice")}
                      fullWidth
                      size="small"
                      disabled
                      value={packagePrice !== null ? `${packageCurrency} ${packagePrice.toLocaleString()}` : "—"}
                    />
                  </Grid>

                  <Grid size={{ xs: 4, sm: 1.6 }}>
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
                  </Grid>

                  <Grid size={{ xs: 6, sm: 1.6 }}>
                    <TextField
                      label={t("quotation.discountAmount")}
                      type="number"
                      fullWidth
                      size="small"
                      disabled={disabled || packagePrice === null}
                      value={discountAmount !== undefined ? Number(discountAmount.toFixed(2)) : ""}
                      slotProps={{ htmlInput: { min: 0, max: packagePrice ?? undefined } }}
                      onChange={(e) => {
                        if (packagePrice === null) return;
                        const typed = Number(e.target.value);
                        const nextDiscount = Number.isFinite(typed) ? typed : 0;
                        const nextSellingPrice = Math.max(0, packagePrice - nextDiscount);
                        manuallyEditedRef.current[index] = true;
                        setValue(`occupancy_groups.${index}.selling_price`, nextSellingPrice, { shouldValidate: true });
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 1.6 }}>
                    <TextField
                      label={t("quotation.finalSellingPrice")}
                      fullWidth
                      size="small"
                      disabled
                      value={
                        finalAmount !== undefined
                          ? `${packageCurrency} ${finalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : "—"
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 0.6 }}>
                    {!disabled && (
                      <IconButton color="error" onClick={() => remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>

                  {missing && (
                    <Grid size={{ xs: 12 }}>
                      <Alert
                        severity="warning"
                        icon={<WarningAmberIcon fontSize="small" />}
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
                    </Grid>
                  )}
                </Grid>
              </Box>
            );
          })}
        </Stack>
      </Grid>

      {fields.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Box display="flex" justifyContent="flex-end">
            <Typography variant="subtitle1" fontWeight={600}>
              {t("quotation.grandTotal")}: {packageCurrency} {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
