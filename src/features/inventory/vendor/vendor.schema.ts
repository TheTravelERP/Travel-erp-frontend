// src/features/inventory/vendor/vendor.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getVendorSchema = (t: TFunction) =>
  z.object({
    vendor_code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
    vendor_name: z.string().trim().min(1, t('validation.nameRequired')).max(200),
    vendor_type: z.string().trim().optional(),
    contact_person: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    email: z.string().trim().optional(),
    website: z.string().trim().optional(),
    gstin: z.string().trim().optional(),
    pan: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    payment_terms: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    status: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type VendorSchema = ReturnType<typeof getVendorSchema>;
