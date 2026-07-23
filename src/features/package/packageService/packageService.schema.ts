// src/features/package/packageService/packageService.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getPackageServiceSchema = (t: TFunction) =>
  z.object({
    package_uuid: z.string().trim().min(1, t('packageService.validation.packageRequired')),
    day_no: z.coerce.number().int().min(1).optional(),
    service_order: z.coerce.number().int().min(0).optional(),
    service_type: z.string().trim().min(1, t('packageService.validation.serviceTypeRequired')),

    inventory_uuid: z.string().trim().optional(),

    description: z.string().trim().max(255).optional(),

    start_datetime: z.string().trim().optional(),
    end_datetime: z.string().trim().optional(),

    cost_price: z.coerce.number().min(0).optional(),
    selling_price: z.coerce.number().min(0).optional(),

    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type PackageServiceSchema = ReturnType<typeof getPackageServiceSchema>;
