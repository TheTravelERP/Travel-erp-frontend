// src/features/package/package.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getPackageSchema = (t: TFunction) =>
  z.object({
    package_type_uuid: z.string().nullable().optional(),
    package_detail_uuid: z.string().nullable().optional(),

    code: z.string().trim().min(1, t('package.validation.codeRequired')).max(50, t('package.validation.codeTooLong')),
    name: z.string().trim().min(1, t('package.validation.nameRequired')).max(200, t('package.validation.nameTooLong')),
    short_name: z.string().trim().optional(),

    status: z.string().trim().optional(),

    departure_city: z.string().trim().optional(),
    arrival_city: z.string().trim().optional(),
    country: z.string().trim().optional(),

    departure_date: z.string().trim().optional(),
    return_date: z.string().trim().optional(),
    booking_start_date: z.string().trim().optional(),
    booking_end_date: z.string().trim().optional(),

    duration_days: z.coerce.number().int().min(0).optional(),
    duration_nights: z.coerce.number().int().min(0).optional(),

    minimum_pax: z.coerce.number().int().min(0).optional(),
    maximum_pax: z.coerce.number().int().min(0).optional(),

    total_seats: z.coerce.number().int().min(0).optional(),
    booked_seats: z.coerce.number().int().min(0).optional(),
    blocked_seats: z.coerce.number().int().min(0).optional(),
    waitlist_seats: z.coerce.number().int().min(0).optional(),

    currency_code: z
      .string()
      .trim()
      .min(3, t('package.validation.currencyCodeLength'))
      .max(3, t('package.validation.currencyCodeLength')),
    exchange_rate: z.coerce.number().min(0).optional(),

    featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
  });

export type PackageSchema = ReturnType<typeof getPackageSchema>;
