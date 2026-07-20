// src/features/customer/customer.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getCustomerSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired')),
    first_name: z.string().trim().optional(),
    last_name: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    dob: z.string().optional(),
    nationality: z.string().trim().optional(),

    passport_no: z.string().trim().optional(),
    passport_issue_date: z.string().optional(),
    passport_expiry_date: z.string().optional(),
    passport_issue_country: z.string().trim().optional(),

    email: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: t('validation.emailInvalid'),
      }),
    mobile: z
      .string()
      .trim()
      .min(1, t('validation.mobileRequired'))
      .refine((value) => /^\+[1-9][0-9]{7,15}$/.test(value), {
        message: t('validation.internationalMobile'),
      }),

    gstin: z.string().trim().optional(),
    billing_address: z.string().trim().optional(),
  });

export type CustomerSchema = ReturnType<typeof getCustomerSchema>;
