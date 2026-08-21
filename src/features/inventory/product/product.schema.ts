// src/features/inventory/product/product.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getProductSchema = (t: TFunction) =>
  z.object({
    product_code: z.string().trim().min(1, t('validation.codeRequired')).max(30),
    product_name: z.string().trim().min(1, t('validation.nameRequired')).max(200),
    description: z.string().trim().optional(),
    location_uuid: z.string().trim().min(1, t('product.validation.locationRequired')),
    service_type_uuid: z.string().trim().min(1, t('product.validation.serviceTypeRequired')),
    vendor_uuid: z.string().trim().min(1, t('product.validation.vendorRequired')),
    is_active: z.boolean().optional(),
  });

export type ProductSchema = ReturnType<typeof getProductSchema>;
