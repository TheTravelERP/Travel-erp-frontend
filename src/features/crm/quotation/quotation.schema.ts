// src/features/crm/quotation/quotation.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { MOBILE_NUMBER_REGEX } from '../../../utils/validator';

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
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    remarks: z.string().nullish(),
  });

export const getQuotationSchema = (t: TFunction) =>
  z.object({
    // Optional — when no enquiry is picked (Direct Quotation), the
    // customer_*/cust_uuid fields below are required instead.
    enquiry_uuid: z.string().trim().optional(),
    cust_uuid: z.string().nullable().optional(),
    customer_mode: z.enum(['new', 'existing']).optional(),
    customer_name: z.string().trim().optional(),
    customer_mobile: z.string().optional(),
    customer_email: z.string().email().optional().or(z.literal('')),

    business_type: z.string().trim().min(1, t('quotation.validation.businessTypeRequired')),

    pkg_uuid: z.string().nullable().optional(),
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
    service_lines: z.array(serviceLineSchema(t)).min(1, t('quotation.validation.atLeastOneLine')),
  }).refine(
    (data) => !data.travel_date_from || !data.travel_date_to || data.travel_date_from <= data.travel_date_to,
    { message: t('validation.endDateBeforeStartDate'), path: ['travel_date_to'] },
  ).refine(
    (data) => !data.quotation_date || !data.valid_until || data.valid_until >= data.quotation_date,
    { message: t('validation.endDateBeforeStartDate'), path: ['valid_until'] },
  ).refine(
    (data) =>
      !!data.enquiry_uuid ||
      !!data.cust_uuid ||
      (!!data.customer_name?.trim() && !!data.customer_mobile),
    {
      message: t('quotation.validation.customerOrEnquiryRequired'),
      path: ['customer_name'],
    },
  ).refine(
    (data) =>
      !!data.enquiry_uuid ||
      !!data.cust_uuid ||
      !data.customer_mobile ||
      MOBILE_NUMBER_REGEX.test(data.customer_mobile),
    {
      message: t('validation.internationalMobile'),
      path: ['customer_mobile'],
    },
  ).refine(
    (data) => data.business_type !== 'Package' || !!data.pkg_uuid,
    {
      message: t('quotation.validation.packageRequired'),
      path: ['pkg_uuid'],
    },
  );

export type QuotationSchema = ReturnType<typeof getQuotationSchema>;
