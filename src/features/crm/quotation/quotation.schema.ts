// src/features/crm/quotation/quotation.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { validateDiscountValue } from './pricing';

// Shared by both row schemas below (Occupancy Pricing and Service Lines) —
// the unified pricing engine's one validation rule: Percentage caps at 100,
// Amount caps at the row's own Sell Price. Defined once, applied via
// superRefine on each row object so it never drifts between the two forms.
function checkDiscount(t: TFunction) {
  return (
    row: { discount_type?: string; discount_value?: number; selling_price?: number },
    ctx: z.RefinementCtx,
  ) => {
    const type = row.discount_type === 'Amount' ? 'Amount' : 'Percentage';
    const error = validateDiscountValue(type, row.discount_value ?? 0, row.selling_price ?? 0);
    if (error === 'exceeds100') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('quotation.validation.discountPercentMax100'),
        path: ['discount_value'],
      });
    } else if (error === 'exceedsSellPrice') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('quotation.validation.discountExceedsSellPrice'),
        path: ['discount_value'],
      });
    }
  };
}

const serviceLineSchema = (t: TFunction) =>
  z.object({
    uuid: z.string().optional(),
    service_type: z.string().trim().min(1, t('quotation.validation.serviceTypeRequired')),
    vendor_uuid: z.string().nullable().optional(),
    description: z.string().nullish(),
    day_no: z.coerce.number().nullable().optional(),
    travel_date_from: z.string().nullish(),
    travel_date_to: z.string().nullish(),
    quantity: z.coerce.number().gt(0, t('quotation.validation.quantityPositive')),
    unit: z.string().nullish(),
    cost_price: z.coerce.number().min(0),
    selling_price: z.coerce.number().min(0),
    // Wire fields — derived from discount_type/discount_value at submit
    // time (see submitCleaned in QuotationForm.tsx), not edited directly.
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    // Pricing-engine fields the row's inputs actually bind to.
    discount_type: z.enum(['Percentage', 'Amount']).default('Percentage'),
    discount_value: z.coerce.number().min(0).optional().default(0),
    remarks: z.string().nullish(),
  }).superRefine(checkDiscount(t));

// LOCKED: one row = one pricing rule (Occupancy Type + Passenger Type +
// Quantity) — no more mixed Adult/Child/Infant counts within a single row.
const occupancyGroupSchema = (t: TFunction) =>
  z.object({
    occupancy_type: z.string().trim().min(1, t('packagePricing.validation.occupancyTypeRequired')),
    passenger_type: z.string().trim().min(1, t('packagePricing.validation.passengerTypeRequired')),
    quantity: z.coerce
      .number()
      .int()
      .min(1, t('quotation.validation.quantityPositive'))
      .max(999, t('quotation.validation.paxMax999'))
      .default(1),
    selling_price: z.coerce.number().min(0).optional(),
    // Wire fields — derived from discount_type/discount_value at submit
    // time (see submitCleaned in QuotationForm.tsx), not edited directly.
    // Stored the same way service_lines' are (see occupancy_groups on the
    // backend's QuotationOccupancyGroup schema).
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    // Pricing-engine fields the row's inputs actually bind to — see
    // serviceLineSchema above for the shared shape/validation.
    discount_type: z.enum(['Percentage', 'Amount']).default('Percentage'),
    discount_value: z.coerce.number().min(0).optional().default(0),
  }).superRefine(checkDiscount(t));

// `isPackageBusiness` mirrors business_type === "Package" — Occupancy
// Groups and Service Lines coexist for Package (Occupancy mandatory,
// Service Lines optional, for extras beyond the package) while every other
// business type keeps the original service_lines.min(1)/no-Occupancy rules.
export const getQuotationSchema = (t: TFunction, options?: { isPackageBusiness?: boolean }) => {
  const isPackageBusiness = options?.isPackageBusiness ?? false;

  return z.object({
    // Optional — when no enquiry is picked (Direct Quotation), cust_uuid is
    // required instead (see the customerOrEnquiryRequired refine below).
    enquiry_uuid: z.string().trim().optional(),
    cust_uuid: z.string().nullable().optional(),

    business_type: z.string().trim().min(1, t('quotation.validation.businessTypeRequired')),

    pkg_uuid: z.string().nullable().optional(),
    // Header-level commercial value — LOCKED as independent of the
    // Occupancy section; occupancy rows never update this.
    pkg_count: z.coerce
      .number()
      .int()
      .min(1, t('quotation.validation.packageCountMin'))
      .max(999, t('quotation.validation.paxMax999'))
      .default(1),
    quotation_date: z.string().nullish(),
    valid_until: z.string().nullish(),
    travel_date_from: z.string().nullish(),
    travel_date_to: z.string().nullish(),
    pax_adult: z.coerce
      .number()
      .int()
      .min(1, t('quotation.validation.paxAdultMin'))
      .max(999, t('quotation.validation.paxMax999'))
      .default(1),
    pax_child: z.coerce
      .number()
      .int()
      .min(0, t('quotation.validation.paxNoNegative'))
      .max(999, t('quotation.validation.paxMax999'))
      .default(0),
    pax_infant: z.coerce
      .number()
      .int()
      .min(0, t('quotation.validation.paxNoNegative'))
      .max(999, t('quotation.validation.paxMax999'))
      .default(0),
    currency_code: z.string().trim().length(3, t('quotation.validation.currencyCode3')),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    terms_conditions: z.string().nullish(),
    internal_notes: z.string().nullish(),
    customer_notes: z.string().nullish(),
    service_lines: isPackageBusiness
      ? z.array(serviceLineSchema(t))
      : z.array(serviceLineSchema(t)).min(1, t('quotation.validation.atLeastOneLine')),
    occupancy_groups: z.array(occupancyGroupSchema(t)).optional(),
  }).refine(
    (data) => !data.travel_date_from || !data.travel_date_to || data.travel_date_from <= data.travel_date_to,
    { message: t('validation.endDateBeforeStartDate'), path: ['travel_date_to'] },
  ).refine(
    (data) => !data.quotation_date || !data.valid_until || data.valid_until >= data.quotation_date,
    { message: t('validation.endDateBeforeStartDate'), path: ['valid_until'] },
  ).refine(
    (data) => !data.quotation_date || !data.travel_date_from || data.travel_date_from >= data.quotation_date,
    { message: t('validation.endDateBeforeStartDate'), path: ['travel_date_from'] },
  ).refine(
    (data) => !!data.enquiry_uuid || !!data.cust_uuid,
    {
      message: t('quotation.validation.customerOrEnquiryRequired'),
      path: ['cust_uuid'],
    },
  ).refine(
    (data) => data.business_type !== 'Package' || !!data.pkg_uuid,
    {
      message: t('quotation.validation.packageRequired'),
      path: ['pkg_uuid'],
    },
  ).refine(
    (data) => !isPackageBusiness || (data.occupancy_groups ?? []).length > 0,
    {
      message: t('quotation.validation.atLeastOneOccupancyGroup'),
      path: ['occupancy_groups'],
    },
  ).superRefine((data, ctx) => {
    // LOCKED: the Quotation Header (pax_adult/pax_child/pax_infant) is the
    // only source of truth for passenger counts — Occupancy rows must
    // allocate EXACTLY that many before Save succeeds, in either direction
    // (Rule 1: never exceed: Rule 3: must exactly match at Save). The live,
    // non-blocking under-allocation warning during editing (Rule 2) is a
    // separate, purely visual concern handled by the Passenger Allocation
    // summary in QuotationOccupancyGroups.tsx — this is only the Save gate.
    if (!isPackageBusiness) return;
    const allocated: Record<string, number> = { Adult: 0, Child: 0, Infant: 0 };
    for (const group of data.occupancy_groups ?? []) {
      if (group.passenger_type in allocated) {
        allocated[group.passenger_type] += group.quantity ?? 0;
      }
    }
    const header: Record<string, number> = { Adult: data.pax_adult, Child: data.pax_child, Infant: data.pax_infant };
    for (const type of ['Adult', 'Child', 'Infant']) {
      if (allocated[type] > header[type]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('quotation.allocationExceedsQuantity', { type }),
          path: ['occupancy_groups'],
        });
      } else if (allocated[type] < header[type]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('quotation.allocationIncomplete', { count: header[type] - allocated[type], type }),
          path: ['occupancy_groups'],
        });
      }
    }
  });
};

export type QuotationSchema = ReturnType<typeof getQuotationSchema>;
