// src/features/settings/exchangeRate/exchangeRate.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getExchangeRateSchema = (t: TFunction) =>
  z.object({
    from_currency_code: z.string().trim().min(3, t('validation.codeRequired')).max(3),
    to_currency_code: z.string().trim().min(3, t('validation.codeRequired')).max(3),
    rate: z.coerce.number().positive(t('exchangeRate.validation.ratePositive')),
    effective_from: z.string().trim().min(1, t('exchangeRate.validation.effectiveFromRequired')),
    effective_to: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => data.from_currency_code !== data.to_currency_code, {
    message: t('exchangeRate.validation.currenciesMustDiffer'),
    path: ['to_currency_code'],
  })
  .refine((data) => !data.effective_to || data.effective_to >= data.effective_from, {
    message: t('exchangeRate.validation.effectiveToBeforeFrom'),
    path: ['effective_to'],
  });

export type ExchangeRateSchema = ReturnType<typeof getExchangeRateSchema>;
