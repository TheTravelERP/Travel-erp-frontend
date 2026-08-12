// src/features/settings/stateProvinceMaster/stateProvince.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getStateProvinceSchema = (t: TFunction) =>
  z.object({
    country_code: z.string().trim().min(1, t('validation.countryRequired')).max(2),
    city_code: z.string().trim().min(1, t('validation.codeRequired')).max(10),
    name: z.string().trim().min(1, t('validation.nameRequired')).max(100),
    is_active: z.boolean().optional(),
  });

export type StateProvinceSchema = ReturnType<typeof getStateProvinceSchema>;
