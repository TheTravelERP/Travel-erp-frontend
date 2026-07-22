// src/features/inventory/airline/airline.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getAirlineSchema = (t: TFunction) =>
  z.object({
    airline_code: z.string().trim().min(1, t('airline.validation.codeRequired')).max(10, t('airline.validation.codeTooLong')),
    icao_code: z.string().trim().optional(),
    airline_name: z.string().trim().min(1, t('airline.validation.nameRequired')).max(200),
    country: z.string().trim().optional(),
    website: z.string().trim().optional(),
    logo: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type AirlineSchema = ReturnType<typeof getAirlineSchema>;
