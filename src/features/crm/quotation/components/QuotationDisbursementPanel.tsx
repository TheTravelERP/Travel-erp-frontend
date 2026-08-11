// src/features/crm/quotation/components/QuotationDisbursementPanel.tsx
//
// Rule 33 pure-agent disbursement UX (Tax & Pricing Architecture section 5,
// layer 3's tax_context.disbursement fields, layer 4 Task 5) — an opt-in
// panel that only appears for service types where a pass-through fee is
// realistically plausible (the doc's own two named examples: a Visa
// government fee, an Insurance premium). Collapsed/unfilled always means
// disbursement_candidate=false and standard taxation on the full amount —
// this panel never defaults to assuming a fee is a pass-through.

import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { QuotationFormInput } from "../quotation.types";

// Same 7 conditions as RULE_33_CONDITIONS in tax_resolution_service.py —
// every one must be explicitly true for the gate to pass.
const CONDITIONS: { field: string; labelKey: string }[] = [
  { field: "pure_agent_for_payment", labelKey: "quotation.disbursementPureAgent" },
  { field: "third_party_contract_with_recipient", labelKey: "quotation.disbursementThirdPartyContract" },
  { field: "recipient_liable_to_pay", labelKey: "quotation.disbursementRecipientLiable" },
  { field: "recipient_authorized_payment", labelKey: "quotation.disbursementRecipientAuthorized" },
  { field: "amount_shown_separately", labelKey: "quotation.disbursementAmountSeparate" },
  { field: "no_markup_recovered", labelKey: "quotation.disbursementNoMarkup" },
  { field: "additional_to_own_service", labelKey: "quotation.disbursementAdditionalService" },
];

// Service types where a pass-through fee realistically applies — the
// backend gate itself is generic (any disbursement_candidate line, any
// service_type), but surfacing this panel everywhere would be clutter/
// confusion for lines where it never legitimately applies (e.g. Hotel).
export const DISBURSEMENT_ELIGIBLE_SERVICE_TYPES = new Set(["Visa", "Insurance"]);

interface Props {
  control: Control<QuotationFormInput>;
  lineIndex: number;
  disabled?: boolean;
}

export default function QuotationDisbursementPanel({ control, lineIndex, disabled }: Props) {
  const { t } = useTranslation();

  return (
    <Accordion defaultExpanded={false} sx={{ mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2" fontWeight={600}>{t("quotation.disbursementSectionTitle")}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t("quotation.disbursementHelp")}
        </Typography>

        <Controller
          name={`service_lines.${lineIndex}.disbursement_candidate`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={!!field.value}
                  disabled={disabled}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label={t("quotation.disbursementCandidateToggle")}
            />
          )}
        />

        <Controller
          name={`service_lines.${lineIndex}.disbursement_candidate`}
          control={control}
          render={({ field: candidateField }) =>
            candidateField.value ? (
              <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                {CONDITIONS.map(({ field: conditionField, labelKey }) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={conditionField}>
                    <Controller
                      name={`service_lines.${lineIndex}.tax_context.disbursement.${conditionField}` as any}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={!!field.value}
                              disabled={disabled}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2">{t(labelKey)}</Typography>}
                        />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <span />
            )
          }
        />
      </AccordionDetails>
    </Accordion>
  );
}
