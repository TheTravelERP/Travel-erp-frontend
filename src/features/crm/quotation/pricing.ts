// src/features/crm/quotation/pricing.ts
//
// Unified pricing engine shared by Occupancy Pricing and Service Lines — the
// only difference between the two sections is their business-specific
// fields (Passenger Type vs Description/Vendor); the pricing sequence
// itself (Base Price → Sell Price → Discount Type → Discount Value → Final
// Price) is identical, so it lives here once rather than being duplicated
// per-section. Quotation-only for now — Booking/Invoice will import from
// here too once this pattern is validated there.

export const DISCOUNT_TYPES = ["Percentage", "Amount"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

/** Sell Price minus the resolved discount, floored at 0. Never throws on
 *  out-of-range input — validateDiscountValue is what surfaces the inline
 *  error; this just computes what Final Price would be right now. */
export function computeFinalPrice(
  sellPrice: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  const price = Number(sellPrice) || 0;
  const value = Number(discountValue) || 0;
  const discount = discountType === "Percentage" ? (price * Math.min(value, 100)) / 100 : Math.min(value, price);
  return Math.max(0, price - discount);
}

/** Returns the currency amount actually deducted (for display/backend
 *  wire-mapping), independent of computeFinalPrice's floor-at-0 behavior. */
export function resolveDiscountAmount(sellPrice: number, discountType: DiscountType, discountValue: number): number {
  const price = Number(sellPrice) || 0;
  const value = Number(discountValue) || 0;
  return discountType === "Percentage" ? (price * value) / 100 : value;
}

// Occupancy rows and Service Line rows carry the identical pricing shape
// (selling_price/quantity/discount_type/discount_value) — one row-total and
// one section-total function serves both, and the combined Grand Total in
// QuotationForm.tsx, with nothing pricing-related duplicated per section.
export interface PricedRow {
  selling_price?: number;
  quantity?: number;
  discount_type?: DiscountType;
  discount_value?: number;
}

/** Per-unit Final Price — Sell Price minus discount, quantity-independent.
 *  Purely a display/derivation helper; the backend never receives this
 *  value directly (selling_price it stores is always the raw, undiscounted
 *  price — see toDiscountWireFields below) — never substitute
 *  calculateRowLineTotal for this or vice versa. */
export function calculateRowFinalPrice(row: PricedRow): number {
  return computeFinalPrice(row.selling_price ?? 0, row.discount_type ?? "Percentage", row.discount_value ?? 0);
}

/** Line total — per-unit Final Price × Quantity. This is what the "Final
 *  Price" column actually displays, so it visibly reacts to Quantity
 *  changes too, not just Sell Price/Discount Type/Discount Value. */
export function calculateRowLineTotal(row: PricedRow): number {
  return calculateRowFinalPrice(row) * (Number(row.quantity) || 0);
}

export function calculateSectionTotal(rows: PricedRow[]): number {
  return rows.reduce((sum, row) => sum + calculateRowLineTotal(row), 0);
}

/** Maps the UI-only discount_type/discount_value pair to the wire fields
 *  the backend actually stores (discount_percent wins whenever >0,
 *  discount_amount is the fallback — mirrors _compute_line_amounts on the
 *  backend exactly). selling_price is never touched here — it always
 *  travels raw/undiscounted; the backend applies the discount itself.
 *  Shared by service_lines and occupancy_groups in submitCleaned
 *  (QuotationForm.tsx), since both are stored the same way. */
export function toDiscountWireFields(
  discountType: DiscountType | undefined,
  discountValue: number | undefined,
): { discount_percent: number; discount_amount: number } {
  const type = discountType === "Amount" ? "Amount" : "Percentage";
  const value = discountValue ?? 0;
  return {
    discount_percent: type === "Amount" ? 0 : value,
    discount_amount: type === "Amount" ? value : 0,
  };
}

export type DiscountValidationError = "exceeds100" | "exceedsSellPrice" | null;

/** Percentage: 0–100. Amount: 0–Sell Price. Shared by both sections' zod
 *  row-level superRefine so the rule is defined exactly once. */
export function validateDiscountValue(
  discountType: DiscountType,
  discountValue: number,
  sellPrice: number,
): DiscountValidationError {
  const value = Number(discountValue) || 0;
  if (discountType === "Percentage") {
    return value > 100 ? "exceeds100" : null;
  }
  return value > (Number(sellPrice) || 0) ? "exceedsSellPrice" : null;
}
