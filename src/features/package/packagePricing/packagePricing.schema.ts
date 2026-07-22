// src/features/package/packagePricing/packagePricing.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getPackagePricingSchema = (t: TFunction) =>
  z.object({
    package_uuid: z.string().trim().min(1, t('packagePricing.validation.packageRequired')),
    occupancy_type: z.string().trim().min(1, t('packagePricing.validation.occupancyTypeRequired')),
    passenger_type: z.string().trim().min(1, t('packagePricing.validation.passengerTypeRequired')),
    price_category: z.string().trim().optional(),

    currency_code: z
      .string()
      .trim()
      .min(3, t('packagePricing.validation.currencyCodeLength'))
      .max(3, t('packagePricing.validation.currencyCodeLength')),

    price: z.coerce.number().min(0, t('packagePricing.validation.priceRequired')),

    effective_from: z.string().trim().min(1, t('packagePricing.validation.effectiveFromRequired')),
    effective_to: z.string().trim().optional(),

    is_default: z.boolean().optional(),
    is_active: z.boolean().optional(),
  });

export type PackagePricingSchema = ReturnType<typeof getPackagePricingSchema>;
