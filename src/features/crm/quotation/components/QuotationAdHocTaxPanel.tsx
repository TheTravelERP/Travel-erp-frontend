// src/features/crm/quotation/components/QuotationAdHocTaxPanel.tsx
//
// Ad-Hoc / Quick Quotation Tax Source UX (Layer 3B) — an expandable panel
// that lets a salesperson classify a line's tax treatment explicitly when
// no master or org-level configuration source is available, without ever
// creating an AirlineMaster/ChargeType/Vendor/Inventory record first. The
// frontend only collects FACTS (tax_context.manual_tax_treatment, and —
// only for Agent/Commission — basic_fare/route_type); the backend's
// existing four-function resolver (classify_tax_treatment ->
// resolve_place_of_supply -> resolve_taxable_value -> calculate_tax)
// remains the sole place tax is ever computed. No amount/percentage is
// ever collected here.

import { Accordion, AccordionDetails, AccordionSummary, Box, FormControl, FormControlLabel, FormHelperText, Grid, MenuItem, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { QuotationFormInput } from "../quotation.types";

// Mirrors MANUAL_TAX_TREATMENT_ALLOWED_VALUES / _MANUAL_ONLY_SERVICE_TYPES
// in tax_resolution_service.py exactly. Flight is the one type with a
// master (AirlineMaster) fallback path — the manual candidate only applies
// when no Airline is linked to *this* line. The other four have no master
// concept at all, so the manual candidate is the only way to classify them.
export const AD_HOC_TAX_ELIGIBLE_SERVICE_TYPES = new Set(["Flight", "Activity", "Ziyarat", "Misc", "Manual Charge"]);

// Which manual_tax_treatment values this panel offers per service_type —
// identical to the backend's MANUAL_TAX_TREATMENT_ALLOWED_VALUES map.
// Activity/Ziyarat/Misc/Manual Charge only ever get the one value every
// always-standard service type (Hotel/Visa/Transport/Guide/MICE) already
// resolves to automatically — Agent/Commission is never offered for them
// because the backend does not accept it for these service types.
const TREATMENT_OPTIONS: Record<string, { value: string; labelKey: string }[]> = {
  Flight: [
    { value: "standard_ad_valorem", labelKey: "quotation.adHocTreatmentPrincipal" },
    { value: "agent_deemed_value", labelKey: "quotation.adHocTreatmentAgent" },
  ],
  Activity: [{ value: "standard_ad_valorem", labelKey: "quotation.adHocTreatmentPrincipal" }],
  Ziyarat: [{ value: "standard_ad_valorem", labelKey: "quotation.adHocTreatmentPrincipal" }],
  Misc: [{ value: "standard_ad_valorem", labelKey: "quotation.adHocTreatmentPrincipal" }],
  "Manual Charge": [{ value: "standard_ad_valorem", labelKey: "quotation.adHocTreatmentPrincipal" }],
};

interface Props {
  control: Control<QuotationFormInput>;
  setValue: UseFormSetValue<QuotationFormInput>;
  lineIndex: number;
  serviceType: string;
  disabled?: boolean;
}

export default function QuotationAdHocTaxPanel({ control, setValue, lineIndex, serviceType, disabled }: Props) {
  const { t } = useTranslation();

  const airlineUuid = useWatch({ control, name: `service_lines.${lineIndex}.airline_uuid` });
  const manualTreatment = useWatch({
    control,
    name: `service_lines.${lineIndex}.tax_context.manual_tax_treatment` as any,
  });
  const resolvedTreatment = useWatch({
    control,
    name: `service_lines.${lineIndex}.tax_context.resolved_treatment` as any,
  });

  const isFlight = serviceType === "Flight";
  const isMasterDriven = isFlight && !!airlineUuid;

  // An Airline becomes authoritative the instant one is selected — clear
  // any stale manual candidate/treatment-specific facts so they can never
  // read as an active override, and so re-selecting "no Airline" later
  // starts from a clean slate rather than resurrecting old values (Task
  // 14). The backend already ignores manual_tax_treatment once master_
  // default resolves something (classify_tax_treatment's Flight branch
  // checks master_default first, unconditionally) — this is purely a UI/
  // submitted-payload hygiene measure, not a correctness requirement.
  useEffect(() => {
    if (!isMasterDriven) return;
    setValue(`service_lines.${lineIndex}.tax_context.manual_tax_treatment` as any, undefined, { shouldDirty: false });
    setValue(`service_lines.${lineIndex}.tax_context.basic_fare` as any, undefined, { shouldDirty: false });
    setValue(`service_lines.${lineIndex}.tax_context.route_type` as any, undefined, { shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMasterDriven, lineIndex]);

  if (!AD_HOC_TAX_ELIGIBLE_SERVICE_TYPES.has(serviceType)) return null;

  if (isMasterDriven) {
    // AirlineMaster is authoritative — no editable manual selector. Only a
    // small read-only indicator, and only once the backend has actually
    // resolved something for this exact line (a brand-new, never-yet-saved
    // line has nothing computed yet, so nothing renders here at all).
    if (!resolvedTreatment) return null;
    const label = t(
      TREATMENT_OPTIONS.Flight.find((opt) => opt.value === resolvedTreatment)?.labelKey ?? "",
      { defaultValue: resolvedTreatment },
    );
    return (
      <Box sx={{ mt: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {t("quotation.treatment")}: {label}
        </Typography>
      </Box>
    );
  }

  const options = TREATMENT_OPTIONS[serviceType] ?? [];
  const showAgentFacts = isFlight && manualTreatment === "agent_deemed_value";

  return (
    <Accordion defaultExpanded={false} sx={{ mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2" fontWeight={600}>{t("quotation.adHocTaxSectionTitle")}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {isFlight ? t("quotation.adHocTaxHelpFlight") : t("quotation.adHocTaxHelp")}
        </Typography>

        <Controller
          name={`service_lines.${lineIndex}.tax_context.manual_tax_treatment` as any}
          control={control}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error}>
              <RadioGroup value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)}>
                {options.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    disabled={disabled}
                    control={<Radio size="small" />}
                    label={t(opt.labelKey)}
                  />
                ))}
              </RadioGroup>
              {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
            </FormControl>
          )}
        />

        {showAgentFacts && (
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name={`service_lines.${lineIndex}.tax_context.basic_fare` as any}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    label={t("quotation.basicFare")}
                    fullWidth
                    size="small"
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name={`service_lines.${lineIndex}.tax_context.route_type` as any}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    select
                    label={t("quotation.routeType")}
                    fullWidth
                    size="small"
                    disabled={disabled}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="domestic">{t("quotation.routeTypeDomestic")}</MenuItem>
                    <MenuItem value="international">{t("quotation.routeTypeInternational")}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
