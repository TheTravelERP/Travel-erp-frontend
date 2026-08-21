// src/features/inventory/productPrice/productPrice.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

// Same closed set the backend validates against (TAX_MODES in
// product_price_schema.py) — reused, not duplicated as a new concept.
const TAX_MODES = ['inclusive', 'exclusive', 'system_default'] as const;

export const getProductPriceSchema = (t: TFunction) =>
  z
    .object({
      product_uuid: z.string().trim().min(1, t('productPrice.validation.productRequired')),
      price_code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
      valid_from: z.string().trim().min(1, t('productPrice.validation.validFromRequired')),
      valid_to: z.string().trim().min(1, t('productPrice.validation.validToRequired')),
      currency_code: z.string().trim().min(3, t('validation.codeRequired')).max(3),
      cost_price: z
        .string()
        .trim()
        .min(1, t('productPrice.validation.costPriceRequired'))
        .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
          message: t('productPrice.validation.costPriceInvalid'),
        }),
      sell_price: z
        .string()
        .trim()
        .min(1, t('productPrice.validation.sellPriceRequired'))
        .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
          message: t('productPrice.validation.sellPriceInvalid'),
        }),
      tax_treatment: z.string().trim().optional(),
      remarks: z.string().trim().optional(),
      is_active: z.boolean().optional(),

      // ---------- Tax Configuration (a real FK into the Tax Code master) ----------
      tax_code_uuid: z.string().trim().optional(),
      cost_tax_mode: z.string().trim().optional(),
      sell_tax_mode: z.string().trim().optional(),
    })
    .refine((data) => data.valid_to >= data.valid_from, {
      message: t('vendorContract.validation.validToBeforeValidFrom'),
      path: ['valid_to'],
    })
    .refine(
      (data) => !data.cost_tax_mode || (TAX_MODES as readonly string[]).includes(data.cost_tax_mode),
      { message: t('productPrice.validation.taxModeInvalid'), path: ['cost_tax_mode'] },
    )
    .refine(
      (data) => !data.sell_tax_mode || (TAX_MODES as readonly string[]).includes(data.sell_tax_mode),
      { message: t('productPrice.validation.taxModeInvalid'), path: ['sell_tax_mode'] },
    );

export type ProductPriceSchema = ReturnType<typeof getProductPriceSchema>;
