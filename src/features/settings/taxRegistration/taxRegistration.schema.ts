// src/features/settings/taxRegistration/taxRegistration.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getTaxRegistrationSchema = (t: TFunction) =>
  z.object({
    label: z.string().trim().min(1, t('taxRegistration.validation.labelRequired')).max(50),
    registration_number: z.string().trim().min(1, t('taxRegistration.validation.numberRequired')).max(50),
    country: z.string().trim().max(100).optional(),
    is_active: z.boolean().optional(),
  });

export type TaxRegistrationSchema = ReturnType<typeof getTaxRegistrationSchema>;
