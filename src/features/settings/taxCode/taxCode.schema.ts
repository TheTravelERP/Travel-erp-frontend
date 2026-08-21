// src/features/settings/taxCode/taxCode.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getTaxCodeSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().min(1, t('validation.codeRequired')).max(30),
    name: z.string().trim().min(1, t('validation.nameRequired')).max(100),
    rate: z
      .string()
      .trim()
      .min(1, t('taxCode.validation.rateRequired'))
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, {
        message: t('taxCode.validation.rateInvalid'),
      }),
    tax_type: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type TaxCodeSchema = ReturnType<typeof getTaxCodeSchema>;
