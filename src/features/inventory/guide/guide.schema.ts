// src/features/inventory/guide/guide.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getGuideSchema = (t: TFunction) =>
  z.object({
    guide_name: z.string().trim().min(1, t('guide.validation.nameRequired')).max(200),
    mobile: z.string().trim().optional(),
    email: z.string().trim().optional(),
    languages: z.string().trim().optional(),
    license_no: z.string().trim().optional(),
    experience_years: z.coerce.number().int().min(0).optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type GuideSchema = ReturnType<typeof getGuideSchema>;
