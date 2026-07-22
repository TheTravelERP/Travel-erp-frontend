// src/features/package/packageDetail/packageDetail.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getPackageDetailSchema = (t: TFunction) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, t('packageDetail.validation.titleRequired'))
      .max(200, t('packageDetail.validation.titleTooLong')),
    overview: z.string().trim().optional(),
    itinerary: z
      .array(
        z.object({
          day: z.coerce.number().int().min(1, t('packageDetail.validation.dayInvalid')),
          title: z.string().trim().min(1, t('packageDetail.validation.dayTitleRequired')),
          description: z.string().trim().optional(),
        }),
      )
      .optional(),
    inclusions: z.string().trim().optional(),
    exclusions: z.string().trim().optional(),
    terms_conditions: z.string().trim().optional(),
    payment_policy: z.string().trim().optional(),
    cancellation_policy: z.string().trim().optional(),
    important_notes: z.string().trim().optional(),
    brochure_path: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type PackageDetailSchema = ReturnType<typeof getPackageDetailSchema>;
