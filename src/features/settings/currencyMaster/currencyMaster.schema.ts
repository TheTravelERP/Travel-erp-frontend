// src/features/settings/currencyMaster/currencyMaster.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getCurrencyMasterSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().min(3, t('currencyMaster.validation.codeLength')).max(3, t('currencyMaster.validation.codeLength')),
    name: z.string().trim().min(1, t('validation.nameRequired')).max(50),
    symbol: z.string().trim().max(10).optional(),
    decimal_places: z.coerce.number().int().min(0).max(6).optional(),
    is_active: z.boolean().optional(),
  });

export type CurrencyMasterSchema = ReturnType<typeof getCurrencyMasterSchema>;
