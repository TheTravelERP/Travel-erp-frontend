// src/features/settings/currencyRatePolicy/currencyRatePolicy.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getCurrencyRatePolicySchema = (t: TFunction) =>
  z.object({
    from_currency_code: z.string().trim().min(3, t('validation.codeRequired')).max(3),
    to_currency_code: z.string().trim().min(3, t('validation.codeRequired')).max(3),
    rate_source: z.enum(['market', 'markup', 'manual']),
    markup_percent: z.coerce.number().optional(),
    manual_rate: z.coerce.number().positive().optional(),
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
  })
  .refine((data) => data.rate_source !== 'markup' || data.markup_percent !== undefined, {
    message: t('currencyRatePolicy.validation.markupPercentRequired'),
    path: ['markup_percent'],
  })
  .refine((data) => data.rate_source !== 'manual' || data.manual_rate !== undefined, {
    message: t('currencyRatePolicy.validation.manualRateRequired'),
    path: ['manual_rate'],
  });

export type CurrencyRatePolicySchema = ReturnType<typeof getCurrencyRatePolicySchema>;
