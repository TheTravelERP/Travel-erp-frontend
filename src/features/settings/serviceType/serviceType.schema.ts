// src/features/settings/serviceType/serviceType.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getServiceTypeSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().min(1, t('validation.codeRequired')).max(10),
    name: z.string().trim().min(1, t('validation.nameRequired')).max(100),
    description: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type ServiceTypeSchema = ReturnType<typeof getServiceTypeSchema>;
