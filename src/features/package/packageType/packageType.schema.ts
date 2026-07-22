// src/features/package/packageType/packageType.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getPackageTypeSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().min(1, t('packageType.validation.codeRequired')).max(20, t('packageType.validation.codeTooLong')),
    name: z.string().trim().min(1, t('packageType.validation.nameRequired')).max(100, t('packageType.validation.nameTooLong')),
    category: z.string().trim().min(1, t('packageType.validation.categoryRequired')).max(50, t('packageType.validation.categoryTooLong')),
    description: z.string().trim().optional(),
    sort_order: z.coerce.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  });

export type PackageTypeSchema = ReturnType<typeof getPackageTypeSchema>;
