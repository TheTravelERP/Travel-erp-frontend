// src/features/inventory/transportCompany/transportCompany.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getTransportCompanySchema = (t: TFunction) =>
  z.object({
    company_name: z.string().trim().min(1, t('transportCompany.validation.nameRequired')).max(200),
    contact_person: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    email: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    gstin: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type TransportCompanySchema = ReturnType<typeof getTransportCompanySchema>;
