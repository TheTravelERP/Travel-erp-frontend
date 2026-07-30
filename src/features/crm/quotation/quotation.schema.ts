// src/features/crm/quotation/quotation.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

const serviceLineSchema = (t: TFunction) =>
  z.object({
    uuid: z.string().optional(),
    service_type: z.string().trim().min(1, t('quotation.validation.serviceTypeRequired')),
    vendor_uuid: z.string().nullable().optional(),
    description: z.string().optional(),
    day_no: z.coerce.number().nullable().optional(),
    travel_date_from: z.string().optional(),
    travel_date_to: z.string().optional(),
    quantity: z.coerce.number().gt(0, t('quotation.validation.quantityPositive')),
    unit: z.string().optional(),
    cost_price: z.coerce.number().min(0),
    selling_price: z.coerce.number().min(0),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    remarks: z.string().optional(),
  });

export const getQuotationSchema = (t: TFunction) =>
  z.object({
    enquiry_uuid: z.string().trim().min(1, t('quotation.validation.enquiryRequired')),
    pkg_uuid: z.string().nullable().optional(),
    quotation_date: z.string().optional(),
    valid_until: z.string().optional(),
    travel_date_from: z.string().optional(),
    travel_date_to: z.string().optional(),
    pax_adult: z.coerce.number().int().min(0).default(0),
    pax_child: z.coerce.number().int().min(0).default(0),
    pax_infant: z.coerce.number().int().min(0).default(0),
    currency_code: z.string().trim().length(3, t('quotation.validation.currencyCode3')),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    terms_conditions: z.string().optional(),
    internal_notes: z.string().optional(),
    customer_notes: z.string().optional(),
    service_lines: z.array(serviceLineSchema(t)).min(1, t('quotation.validation.atLeastOneLine')),
  }).refine(
    (data) => !data.travel_date_from || !data.travel_date_to || data.travel_date_from <= data.travel_date_to,
    { message: t('validation.endDateBeforeStartDate'), path: ['travel_date_to'] },
  );

export type QuotationSchema = ReturnType<typeof getQuotationSchema>;
