// src/features/inventory/ziyarat/ziyarat.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getZiyaratSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(1, t('ziyarat.validation.nameRequired')).max(200),
    city: z.string().trim().optional(),
    duration_hours: z.coerce.number().min(0).optional(),
    description: z.string().trim().optional(),
    places_covered: z.string().trim().optional(),
    default_cost: z.coerce.number().min(0).optional(),
    pickup_location: z.string().trim().optional(),
    drop_location: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type ZiyaratSchema = ReturnType<typeof getZiyaratSchema>;
