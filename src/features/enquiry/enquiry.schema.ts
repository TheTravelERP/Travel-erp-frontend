// src/features/enquiry/enquiry.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getEnquirySchema = (t: TFunction) =>
  z
    .object({
      // customer
      cust_uuid: z.string().nullable().optional(),
      customer_mode: z.enum(['new', 'existing']),
      customer_name: z.string().trim().optional(),
      customer_mobile: z.string().optional(),
      customer_email: z.string().email().optional().or(z.literal('')),

      // package
      pkg_uuid: z.string().nullable().optional(),
      package_mode: z.enum(['custom', 'existing']),
      package_name: z.string().trim().optional(),

      // enquiry core
      pax_count: z.coerce
        .number({ invalid_type_error: t('enquiry.validation.paxInvalid') })
        .int(t('enquiry.validation.paxWholeNumber'))
        .min(1, t('enquiry.validation.minPax'))
        .max(9999, t('enquiry.validation.maxPax')),
      lead_source: z.string().trim().min(1, t('enquiry.validation.leadSourceRequired')),
      enquiry_priority: z.string().trim().min(1, t('enquiry.validation.priorityRequired')),
      conversion_status: z.string().trim().min(1, t('enquiry.validation.statusRequired')),
      description: z.string().optional(),
    })
    .refine(
      (data) =>
        data.customer_mode !== 'new' ||
        (!!data.customer_name && data.customer_name.trim().length > 0),
      {
        message: t('enquiry.validation.customerRequired'),
        path: ['customer_name'],
      }
    )
    .refine(
      (data) => data.customer_mode !== 'existing' || !!data.cust_uuid,
      {
        message: t('enquiry.validation.customerRequired'),
        path: ['cust_uuid'],
      }
    )
    .refine(
      (data) =>
        data.customer_mode !== 'new' ||
        (!!data.customer_mobile && data.customer_mobile.length > 0),
      {
        message: t('enquiry.validation.mobileRequired'),
        path: ['customer_mobile'],
      }
    )
    .refine(
      (data) =>
        data.customer_mode !== 'new' ||
        !data.customer_mobile ||
        /^\+[1-9][0-9]{7,15}$/.test(data.customer_mobile),
      {
        message: t('validation.internationalMobile'),
        path: ['customer_mobile'],
      }
    )
    .refine(
      (data) =>
        data.package_mode !== 'custom' ||
        (!!data.package_name && data.package_name.trim().length > 0),
      {
        message: t('enquiry.validation.packageRequired'),
        path: ['package_name'],
      }
    )
    .refine(
      (data) => data.package_mode !== 'existing' || !!data.pkg_uuid,
      {
        message: t('enquiry.validation.packageRequired'),
        path: ['pkg_uuid'],
      }
    )
    .refine(
      (data) => !data.customer_name || !/^\d+$/.test(data.customer_name.trim()),
      {
        message: t('enquiry.validation.customerNameNotNumeric'),
        path: ['customer_name'],
      }
    );

export type EnquirySchema = ReturnType<typeof getEnquirySchema>;
