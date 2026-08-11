// src/features/crm/quotation/taxDisplay.ts
//
// Pure display helpers for the tax breakdown UI (Tax & Pricing Architecture
// layer 4, Task 4) — no calculation happens here, only presentation of
// values the backend already resolved and returned. Kept out of
// QuotationViewPage.tsx so that file stays focused on layout.

import type { QuotationServiceLineDetail } from "./quotation.types";

// i18n key for each treatment token classify_tax_treatment() can return
// (Layers 2-3) — used both for the per-line detail panel and the footer's
// grouping subtotals. "undetermined" never reaches here (blocked at save).
//
// agent_deemed_value's label was updated to business language ("Agent /
// Commission") as part of the Master/Vendor/Inventory review — that value
// is only ever returned for Flight lines, so it's safe to relabel globally.
// standard_ad_valorem's "Standard" label is deliberately left as-is: unlike
// agent_deemed_value, this same value is also returned for Hotel/Visa/
// Transport/Guide/MICE lines (_ALWAYS_STANDARD_SERVICE_TYPES) that have
// nothing to do with an airline's Principal/Reseller model — relabeling it
// to "Principal / Reseller" here would mislabel every one of those lines.
export const TREATMENT_LABEL_KEYS: Record<string, string> = {
  standard_ad_valorem: "quotation.treatmentStandardAdValorem",
  agent_deemed_value: "quotation.treatmentAgentCommission",
  package_composite: "quotation.treatmentPackageComposite",
  rent_a_cab_concessional: "quotation.treatmentRentACabConcessional",
  forex_valuation: "quotation.treatmentForexValuation",
  insurance_commission_only: "quotation.treatmentInsuranceCommissionOnly",
  margin_scheme: "quotation.treatmentMarginScheme",
  reverse_charge: "quotation.treatmentReverseCharge",
};

// resolved_treatment_source (Layer 3A/3B) — how the resolved treatment was
// determined: a master (AirlineMaster/Package), an org-level Localization
// Profile election (Rent-a-cab/Forex/Insurance), or an explicit manual
// candidate the salesperson supplied (Ad-Hoc / Quick Quotation). Absent for
// the unconditional-always-standard service types (Hotel/Visa/Transport/
// Guide/MICE) and reverse_charge, where none of the three would be an
// honest label — the view simply shows nothing for those, never a guess.
export const TREATMENT_SOURCE_LABEL_KEYS: Record<string, string> = {
  master: "quotation.adHocSourceMaster",
  localization_profile: "quotation.adHocSourceLocalizationProfile",
  manual: "quotation.adHocSourceManual",
};

export interface TreatmentGroupSubtotal {
  treatment: string;
  taxableTotal: number;
}

// "Grouping subtotals" above the CGST/SGST/IGST breakdown (section 10) —
// kept flexible rather than hardcoded to exactly two categories: derived
// from whichever distinct resolved treatments are actually present on this
// quotation's lines, in first-seen order. A line with no resolved_treatment
// yet (should not happen for a saved quotation, but defends against stale/
// pre-Layer-2 data) falls into "standard_ad_valorem" rather than being
// silently dropped from the total.
export function groupLinesByTreatment(lines: QuotationServiceLineDetail[]): TreatmentGroupSubtotal[] {
  const order: string[] = [];
  const totals = new Map<string, number>();

  for (const line of lines) {
    const treatment = line.tax_context?.resolved_treatment || "standard_ad_valorem";
    if (!totals.has(treatment)) {
      totals.set(treatment, 0);
      order.push(treatment);
    }
    totals.set(treatment, totals.get(treatment)! + (line.taxable_amount ?? 0));
  }

  return order.map((treatment) => ({ treatment, taxableTotal: totals.get(treatment)! }));
}
