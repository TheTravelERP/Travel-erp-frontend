// src/features/settings/location/location.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getLocationSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
    name: z.string().trim().min(1, t('validation.nameRequired')).max(200),
    country_code: z.string().trim().min(1, t('validation.countryRequired')),
    city_code: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type LocationSchema = ReturnType<typeof getLocationSchema>;
