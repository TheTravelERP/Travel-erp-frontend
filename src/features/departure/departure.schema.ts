// src/features/departure/departure.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getDepartureSchema = (t: TFunction) =>
  z
    .object({
      pkg_uuid: z.string().trim().min(1, t('departure.validation.packageRequired')),
      sales_executive_uuid: z.string().trim().optional(),
      departure_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
      departure_date: z.string().trim().min(1, t('departure.validation.departureDateRequired')),
      return_date: z.string().trim().optional(),
      status: z.string().trim().optional(),
      total_seats: z.coerce.number().min(0).optional(),
      minimum_pax: z.coerce.number().min(0).optional(),
      maximum_pax: z.coerce.number().min(0).optional(),
      waitlist_seats: z.coerce.number().min(0).optional(),
      remarks: z.string().trim().optional(),
      internal_notes: z.string().trim().optional(),
      is_active: z.boolean().optional(),
      allowed_branch_uuids: z.array(z.string()).optional(),
    })
    .refine(
      (data) => !data.return_date || !data.departure_date || data.return_date >= data.departure_date,
      {
        message: t('departure.validation.returnBeforeDeparture'),
        path: ['return_date'],
      },
    );

export type DepartureSchema = ReturnType<typeof getDepartureSchema>;
