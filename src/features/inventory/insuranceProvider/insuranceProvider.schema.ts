// src/features/inventory/insuranceProvider/insuranceProvider.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getInsuranceProviderSchema = (t: TFunction) =>
  z.object({
    provider_name: z.string().trim().min(1, t('insuranceProvider.validation.nameRequired')).max(200),
    contact_person: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().optional(),
    website: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type InsuranceProviderSchema = ReturnType<typeof getInsuranceProviderSchema>;
