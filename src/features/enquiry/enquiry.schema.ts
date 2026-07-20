// src/features/enquiry/enquiry.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getEnquirySchema = (t: TFunction) =>
  z
    .object({
      // customer
      cust_id: z.number().nullable().optional(),
      customer_name: z.string().trim().optional(),
      customer_mobile: z.string().optional(),
      customer_email: z.string().email().optional().or(z.literal('')),

      // package
      pkg_id: z.number().nullable().optional(),
      package_name: z.string().trim().optional(),

      // enquiry core
      pax_count: z.coerce.number().min(1, t('enquiry.validation.minPax')),
      lead_source: z.string().trim().min(1, t('enquiry.validation.leadSourceRequired')),
      enquiry_priority: z.string().trim().min(1, t('enquiry.validation.priorityRequired')),
      conversion_status: z.string().trim().min(1, t('enquiry.validation.statusRequired')),
      description: z.string().optional(),
    })
    .refine(
      (data) =>
        data.cust_id ||
        (data.customer_name && data.customer_name.length > 0),
      {
        message: t('enquiry.validation.customerRequired'),
        path: ['customer_name'],
      }
    )
    .refine(
      (data) =>
        !!data.cust_id ||
        (!!data.customer_mobile && data.customer_mobile.length > 0),
      {
        message: t('enquiry.validation.mobileRequired'),
        path: ['customer_mobile'],
      }
    )
    .refine(
      (data) =>
        !!data.cust_id ||
        !data.customer_mobile ||
        /^\+[1-9][0-9]{7,15}$/.test(data.customer_mobile),
      {
        message: t('validation.internationalMobile'),
        path: ['customer_mobile'],
      }
    )
    .refine(
      (data) =>
        data.pkg_id ||
        (data.package_name && data.package_name.length > 0),
      {
        message: t('enquiry.validation.packageRequired'),
        path: ['package_name'],
      }
    );

export type EnquirySchema = ReturnType<typeof getEnquirySchema>;
