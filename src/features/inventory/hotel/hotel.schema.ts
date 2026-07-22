// src/features/inventory/hotel/hotel.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getHotelSchema = (t: TFunction) =>
  z.object({
    hotel_code: z.string().trim().min(1, t('hotel.validation.codeRequired')).max(20, t('hotel.validation.codeTooLong')),
    hotel_name: z.string().trim().min(1, t('hotel.validation.nameRequired')).max(200),
    hotel_group: z.string().trim().optional(),
    star_rating: z.coerce.number().int().min(1).max(5).optional(),

    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    address: z.string().trim().optional(),

    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    google_map: z.string().trim().optional(),
    distance_from_haram: z.coerce.number().optional(),

    phone: z.string().trim().optional(),
    email: z.string().trim().optional(),
    website: z.string().trim().optional(),

    check_in_time: z.string().trim().optional(),
    check_out_time: z.string().trim().optional(),

    contact_person: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type HotelSchema = ReturnType<typeof getHotelSchema>;
