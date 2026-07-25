// src/features/settings/branch/branch.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { MOBILE_NUMBER_REGEX } from '../../../utils/validator';

export const getBranchSchema = (t: TFunction) =>
  z.object({
    branch_code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
    branch_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
    legal_name: z.string().trim().optional(),
    currency_code: z.string().trim().min(1, t('branch.validation.currencyRequired')).max(3),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || MOBILE_NUMBER_REGEX.test(value), {
        message: t('validation.internationalMobile'),
      }),
    email: z.string().trim().optional(),
    website: z.string().trim().optional(),
    address_line1: z.string().trim().optional(),
    address_line2: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
    timezone: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type BranchSchema = ReturnType<typeof getBranchSchema>;
