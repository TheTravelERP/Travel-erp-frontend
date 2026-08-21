// src/features/crm/quotation/components/QuotationServiceLineRow.tsx
//
// Quotation Service Line — Variant A ("Inline Search Row"), locked after
// visual review. One field starts the line: a free-solo product search
// that either resolves to a real Product (everything it carries — Service
// Type, Vendor, Cost/Sell, Tax Code — locks read-only) or is simply typed
// text, which IS the line (no separate "Manual" option, no toggle, no
// second Vendor/Hotel/Airline picker — those only ever existed to answer a
// question the Product itself already answers). The collapsed row shows
// only what's touched on every line — Search, Qty, Sell, Final — everything
// else (Service Type override, dates, location, cost, tax, discount) sits
// one click away behind the expand chevron.

import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useWatch, type Control, type UseFormGetValues, type UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import type { QuotationFormInput } from "../quotation.types";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useEntityDropdown } from "../../../../hooks/useEntityDropdown";
import { getEntityDropdownOptions } from "../../../../services/dropdown.service";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { DISCOUNT_TYPES, calculateRowLineTotal } from "../pricing";
import type { LineTaxError } from "../lineErrorParser";
import { suggestFixLink } from "../lineErrorParser";
import QuotationDisbursementPanel, { DISBURSEMENT_ELIGIBLE_SERVICE_TYPES } from "./QuotationDisbursementPanel";
import QuotationAdHocTaxPanel, { AD_HOC_TAX_ELIGIBLE_SERVICE_TYPES } from "./QuotationAdHocTaxPanel";

// Product's own Service Type -> the quotation_service_type dropdown's value
// set. Mirrors app/utils/product_service_type_map.py on the backend exactly
// (that module is the single source of truth) — this copy exists ONLY so
// the row can show the correct Service Type the instant a Product is
// picked, before a save round-trip; the backend re-applies the identical
// mapping server-side as the authoritative override regardless (see
// _resolve_product_price/_build_service_lines), so a drift here is a
// cosmetic lag, never a correctness bug.
const PRODUCT_SERVICE_TYPE_CODE_MAP: Record<string, string> = {
  AC: "Hotel",
  FL: "Flight",
  TF: "Transport",
  TG: "Transport",
  RV: "Transport",
  GU: "Guide",
  AV: "Activity",
  CR: "Cruise",
};

interface ProductInfo {
  product_name?: string;
  vendor_name?: string;
  location_name?: string;
  tax_code_code?: string;
  tax_code_rate?: number;
}

interface Props {
  control: Control<QuotationFormInput>;
  setValue: UseFormSetValue<QuotationFormInput>;
  getValues: UseFormGetValues<QuotationFormInput>;
  index: number;
  disabled?: boolean;
  currencyCode: string;
  priceAsOfDate: string;
  onRemove: () => void;
  lineError?: LineTaxError;
}

export default function QuotationServiceLineRow({
  control,
  setValue,
  getValues,
  index,
  disabled,
  currencyCode,
  priceAsOfDate,
  onRemove,
  lineError,
}: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const line = useWatch({ control, name: `service_lines.${index}` });
  const isProductDriven = !!line?.product_price_uuid;

  const [expanded, setExpanded] = useState(!!lineError);
  const [productInfo, setProductInfo] = useState<ProductInfo | undefined>(() =>
    isProductDriven
      ? {
          product_name: (line as any)?.product_name ?? undefined,
          vendor_name: (line as any)?.vendor_name ?? undefined,
          location_name: (line as any)?.location_name ?? undefined,
          tax_code_code: (line as any)?.tax_code_code ?? undefined,
          tax_code_rate: (line as any)?.tax_code_rate ?? undefined,
        }
      : undefined,
  );
  const [searchText, setSearchText] = useState(
    () => productInfo?.product_name ?? line?.description ?? "",
  );
  const [resolving, setResolving] = useState(false);

  const { options: productOptions, loading: searchLoading, setSearch } = useEntityDropdown({
    dropdownName: "products",
    pageSize: 20,
  });

  const quantityNum = Number(line?.quantity) || 0;
  const sellingPrice = line?.selling_price;
  const discountType = line?.discount_type ?? "Percentage";
  const finalPrice = calculateRowLineTotal({
    selling_price: sellingPrice,
    discount_type: discountType,
    discount_value: line?.discount_value,
    quantity: line?.quantity,
  });
  const grossAmount = quantityNum * (Number(sellingPrice) || 0);
  const discountAmountTotal = Math.max(0, grossAmount - finalPrice);
  // tax_amount/net_amount only ever arrive on a saved/loaded line — the
  // authoritative 4-function tax resolver is server-only, never
  // reimplemented client-side. A brand-new row simply has nothing here yet.
  const taxAmount = (line as any)?.tax_amount;
  const taxPercent = (line as any)?.tax_percent;
  const netAmount = (line as any)?.net_amount;
  const finalAmount = netAmount ?? finalPrice;
  const fixLink = lineError ? suggestFixLink(lineError.reason) : null;

  function clearProductSelection() {
    setValue(`service_lines.${index}.product_price_uuid`, null, { shouldDirty: true });
    setProductInfo(undefined);
  }

  async function handleProductPicked(option: any) {
    setSearchText(option.label);
    setResolving(true);
    try {
      const res = await getEntityDropdownOptions({
        dropdown_name: "product_prices",
        product_uuid: option.value,
        page_size: 50,
      });
      const candidates: any[] = res.items ?? [];
      const best = pickBestProductPrice(candidates, currencyCode, priceAsOfDate);

      if (!best) {
        // A real Product with no priced ProductPrice row yet — still worth
        // inheriting Service Type so tax/place-of-supply have something to
        // work with, but there's nothing to charge: Cost/Sell stay
        // whatever they already were, editable, exactly like a manual line.
        clearProductSelection();
        const mappedType = PRODUCT_SERVICE_TYPE_CODE_MAP[option.service_type_code ?? ""];
        if (mappedType) setValue(`service_lines.${index}.service_type`, mappedType, { shouldDirty: true });
        showSnackbar({ message: t("quotation.productHasNoPrice"), severity: "warning" });
        return;
      }

      if (best.currency_code && best.currency_code !== currencyCode) {
        // Never silently present a foreign-currency price as if it were
        // already in the quotation's own currency — e.g. a USD 240 cost
        // rendered as a locked "240" would invoice a customer for INR 240
        // instead of ~INR 20,000, an 80x understatement no one would catch
        // by eye. Fall back exactly like the no-price case (manual, still
        // Service-Type-inherited), but tell the user the real number and
        // its real currency so they can convert and enter it themselves.
        clearProductSelection();
        const mappedType = PRODUCT_SERVICE_TYPE_CODE_MAP[best.service_type_code ?? ""];
        if (mappedType) setValue(`service_lines.${index}.service_type`, mappedType, { shouldDirty: true });
        showSnackbar({
          message: t("quotation.productPriceCurrencyMismatch", {
            price: best.sell_net_price ?? 0,
            currency: best.currency_code,
            quotationCurrency: currencyCode,
          }),
          severity: "warning",
        });
        return;
      }

      setValue(`service_lines.${index}.product_price_uuid`, best.value, { shouldDirty: true });
      setValue(`service_lines.${index}.cost_price`, best.cost_net_price ?? 0, { shouldDirty: true });
      setValue(`service_lines.${index}.selling_price`, best.sell_net_price ?? 0, { shouldDirty: true });
      const mappedType = PRODUCT_SERVICE_TYPE_CODE_MAP[best.service_type_code ?? ""];
      if (mappedType) setValue(`service_lines.${index}.service_type`, mappedType, { shouldDirty: true });
      if (!getValues(`service_lines.${index}.description`)) {
        setValue(`service_lines.${index}.description`, best.product_name ?? "", { shouldDirty: true });
      }
      setProductInfo({
        product_name: best.product_name ?? undefined,
        vendor_name: best.vendor_name ?? undefined,
        location_name: best.location_name ?? undefined,
        tax_code_code: best.tax_code_code ?? undefined,
        tax_code_rate: best.tax_code_rate ?? undefined,
      });
      setSearchText(best.product_name ?? option.label);
    } finally {
      setResolving(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: "1 1 260px", minWidth: 200 }}>
          <Autocomplete
            freeSolo
            options={productOptions}
            loading={searchLoading}
            disabled={disabled}
            getOptionLabel={(o: any) => (typeof o === "string" ? o : o?.label ?? "")}
            // Products dropdown rows key on their (unique) uuid, never the
            // label — several unrelated products can legitimately share a
            // display name (e.g. code-reuse-after-soft-delete test fixtures
            // in this org), which would otherwise collide as React keys.
            getOptionKey={(o: any) => (typeof o === "string" ? o : o?.value ?? "")}
            filterOptions={(opts) => opts}
            inputValue={searchText}
            onInputChange={(_, value, reason) => {
              setSearchText(value);
              if (reason === "input") {
                setSearch(value);
                if (!isProductDriven) {
                  setValue(`service_lines.${index}.description`, value, { shouldDirty: true });
                }
              }
            }}
            onChange={(_, val) => {
              if (val && typeof val !== "string") {
                void handleProductPicked(val);
              } else if (val === null) {
                clearProductSelection();
                setSearchText("");
                setValue(`service_lines.${index}.description`, "", { shouldDirty: true });
              }
            }}
            onBlur={() => {
              // Typed away from the resolved product name without picking a
              // new option — this line reverts to a plain manual/free-text
              // line with whatever text is now showing.
              if (isProductDriven && searchText !== productInfo?.product_name) {
                clearProductSelection();
                setValue(`service_lines.${index}.description`, searchText, { shouldDirty: true });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("quotation.productOrService")}
                placeholder={t("quotation.productOrServicePlaceholder")}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {resolving && <CircularProgress size={16} sx={{ mr: 1 }} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        <Box sx={{ width: 80, flexShrink: 0 }}>
          <Controller
            name={`service_lines.${index}.quantity`}
            control={control}
            render={({ field: f, fieldState }) => (
              <TextField
                {...f}
                type="number"
                label={t("quotation.quantity")}
                fullWidth
                disabled={disabled}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Box sx={{ width: 130, flexShrink: 0 }}>
          {isProductDriven ? (
            <TextField label={t("quotation.sellingPrice")} fullWidth disabled value={line?.selling_price ?? 0} />
          ) : (
            <Controller
              name={`service_lines.${index}.selling_price`}
              control={control}
              render={({ field: f }) => (
                <TextField {...f} type="number" label={t("quotation.sellingPrice")} fullWidth disabled={disabled} />
              )}
            />
          )}
        </Box>

        <Box sx={{ width: 140, flexShrink: 0 }}>
          <TextField
            label={t("quotation.finalPrice")}
            fullWidth
            disabled
            value={finalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          />
        </Box>

        <IconButton
          size="small"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? t("common.collapse") : t("common.expand")}
          sx={{ mt: 0.75 }}
        >
          {lineError && !expanded && <WarningAmberIcon fontSize="small" color="warning" sx={{ position: "absolute", ml: -0.5, mt: -0.5 }} />}
          <ExpandMoreIcon sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
        </IconButton>

        {!disabled && (
          <IconButton size="small" color="error" onClick={onRemove} aria-label={t("common.delete")} sx={{ mt: 0.75 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {expanded && (
        <Box
          sx={{
            mt: 1,
            p: 2,
            bgcolor: "action.hover",
            borderRadius: 1.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {/* ---- Details ---- */}
          <Stack spacing={1.25} sx={{ flex: "1 1 220px", minWidth: 200 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
              {t("quotation.detailGroupDetails")}
            </Typography>
            <DropdownAutocomplete
              name={`service_lines.${index}.service_type`}
              label={t("quotation.serviceType")}
              control={control}
              dropdownName="quotation_service_type"
              useForm={true}
              allowAdd={false}
              disabled={disabled}
            />
            <Stack direction="row" spacing={1}>
              <Controller
                name={`service_lines.${index}.travel_date_from`}
                control={control}
                render={({ field: f }) => (
                  <TextField
                    {...f}
                    type="date"
                    label={t("quotation.lineTravelDateFrom")}
                    fullWidth
                    disabled={disabled}
                    slotProps={{ inputLabel: { shrink: true } }}
                    onChange={(e) => {
                      f.onChange(e);
                      if (!getValues(`service_lines.${index}.travel_date_to`)) {
                        setValue(`service_lines.${index}.travel_date_to`, e.target.value, { shouldDirty: true });
                      }
                    }}
                  />
                )}
              />
              <Controller
                name={`service_lines.${index}.travel_date_to`}
                control={control}
                render={({ field: f }) => (
                  <TextField
                    {...f}
                    type="date"
                    label={t("quotation.lineTravelDateTo")}
                    fullWidth
                    disabled={disabled}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Stack>
            <Controller
              name={`service_lines.${index}.service_location`}
              control={control}
              render={({ field: f }) => (
                <TextField {...f} value={f.value ?? ""} label={t("quotation.serviceLocation")} fullWidth disabled={disabled} />
              )}
            />
            <Controller
              name={`service_lines.${index}.description`}
              control={control}
              render={({ field: f }) => (
                <TextField {...f} label={t("quotation.description")} fullWidth disabled={disabled} />
              )}
            />
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* ---- Commercial ---- */}
          <Stack spacing={1.25} sx={{ flex: "1 1 200px", minWidth: 180 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
              {t("quotation.detailGroupCommercial")}
            </Typography>
            <Controller
              name={`service_lines.${index}.unit`}
              control={control}
              render={({ field: f }) => (
                <TextField {...f} value={f.value ?? ""} label={t("quotation.unit")} fullWidth disabled={disabled} />
              )}
            />
            {isProductDriven ? (
              <TextField label={t("quotation.costPrice")} fullWidth disabled value={line?.cost_price ?? 0} />
            ) : (
              <Controller
                name={`service_lines.${index}.cost_price`}
                control={control}
                render={({ field: f }) => (
                  <TextField {...f} type="number" label={t("quotation.costPrice")} fullWidth disabled={disabled} />
                )}
              />
            )}
            {isProductDriven && (
              <TextField label={t("quotation.vendor")} fullWidth disabled value={productInfo?.vendor_name ?? ""} />
            )}
            <TextField
              label={t("quotation.gross")}
              fullWidth
              disabled
              value={grossAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            />
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* ---- Tax & Discount ---- */}
          <Stack spacing={1.25} sx={{ flex: "1 1 220px", minWidth: 200 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
              {t("quotation.detailGroupTaxDiscount")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                label={t("quotation.taxCode")}
                fullWidth
                disabled
                value={productInfo?.tax_code_code ?? (line as any)?.tax_context?.resolved_tax_code ?? ""}
              />
              <TextField
                label={t("quotation.taxRate")}
                fullWidth
                disabled
                value={
                  productInfo?.tax_code_rate != null
                    ? `${productInfo.tax_code_rate}%`
                    : taxPercent != null
                      ? `${taxPercent}%`
                      : ""
                }
              />
            </Stack>
            <TextField
              label={t("quotation.taxAmount")}
              fullWidth
              disabled
              value={taxAmount != null ? Number(taxAmount).toLocaleString(undefined, { maximumFractionDigits: 2 }) : ""}
            />
            <Stack direction="row" spacing={1}>
              <Controller
                name={`service_lines.${index}.discount_type`}
                control={control}
                render={({ field: f }) => (
                  <TextField {...f} select label={t("quotation.discountType")} fullWidth disabled={disabled} sx={{ width: 120, flexShrink: 0 }}>
                    {DISCOUNT_TYPES.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {t(opt === "Percentage" ? "quotation.discountTypePercentage" : "quotation.discountTypeAmount")}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name={`service_lines.${index}.discount_value`}
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
                      disabled={disabled}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      slotProps={{ htmlInput: { min: 0, max: discountMax === Infinity ? undefined : discountMax } }}
                      onChange={(e) => {
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
            </Stack>
            <TextField
              label={t("quotation.discountAmount")}
              fullWidth
              disabled
              value={discountAmountTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            />
          </Stack>

          {AD_HOC_TAX_ELIGIBLE_SERVICE_TYPES.has(line?.service_type ?? "") && (
            <Box sx={{ flexBasis: "100%" }}>
              <QuotationAdHocTaxPanel
                control={control}
                setValue={setValue}
                lineIndex={index}
                serviceType={line?.service_type ?? ""}
                disabled={disabled}
              />
            </Box>
          )}

          {DISBURSEMENT_ELIGIBLE_SERVICE_TYPES.has(line?.service_type ?? "") && (
            <Box sx={{ flexBasis: "100%" }}>
              <QuotationDisbursementPanel control={control} lineIndex={index} disabled={disabled} />
            </Box>
          )}

          {lineError && (
            <Alert severity="warning" sx={{ flexBasis: "100%" }}>
              <Typography variant="body2" fontWeight={600}>
                {t("quotation.taxConfigRequired")}
              </Typography>
              <Typography variant="body2">{lineError.reason}</Typography>
              {fixLink && (
                <Link component={RouterLink} to={fixLink.href} target="_blank" rel="noopener noreferrer" variant="body2">
                  {t(fixLink.labelKey)}
                </Link>
              )}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

// Scores each candidate ProductPrice for the given Product: 2 points for
// matching `currencyCode`, 1 point for falling inside its own validity
// window as of `asOfDate` — currency outranks date validity because a
// currency mismatch is a hard reject downstream (handleProductPicked never
// applies a foreign-currency price, see its own comment), so between an
// expired right-currency candidate and a valid wrong-currency one, the
// expired-but-usable one must win rather than losing to one that's about
// to be thrown away anyway. Ties break on the most recent valid_from.
// Plain string comparison is safe here since every date is a YYYY-MM-DD
// string.
function pickBestProductPrice(candidates: any[], currencyCode: string, asOfDate: string): any | null {
  if (!candidates.length) return null;
  let best: any = null;
  let bestScore = -1;
  let bestValidFrom = "";
  for (const c of candidates) {
    const inDate = !!c.valid_from && !!c.valid_to && asOfDate >= c.valid_from && asOfDate <= c.valid_to;
    const currencyMatch = c.currency_code === currencyCode;
    const score = (currencyMatch ? 2 : 0) + (inDate ? 1 : 0);
    const validFrom = c.valid_from ?? "";
    if (score > bestScore || (score === bestScore && validFrom > bestValidFrom)) {
      best = c;
      bestScore = score;
      bestValidFrom = validFrom;
    }
  }
  return best;
}
