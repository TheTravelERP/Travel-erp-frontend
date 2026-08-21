// src/features/inventory/vendor/vendor.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { MOBILE_NUMBER_REGEX } from '../../../utils/validator';

export const getVendorSchema = (t: TFunction) =>
  z.object({
    vendor_code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
    vendor_name: z.string().trim().min(1, t('validation.nameRequired')).max(200),
    contact_person: z.string().trim().optional(),
    mobile: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || MOBILE_NUMBER_REGEX.test(value), {
        message: t('validation.internationalMobile'),
      }),
    email: z.string().trim().optional(),
    website: z.string().trim().optional(),
    gstin: z.string().trim().optional(),
    pan: z.string().trim().optional(),

    physical_address: z.string().trim().optional(),
    physical_city: z.string().trim().optional(),
    physical_country_code: z.string().trim().optional(),
    physical_state_province_code: z.string().trim().optional(),
    physical_pincode: z.string().trim().optional(),

    mailing_address: z.string().trim().optional(),
    mailing_city: z.string().trim().optional(),
    mailing_country_code: z.string().trim().optional(),
    mailing_state_province_code: z.string().trim().optional(),
    mailing_pincode: z.string().trim().optional(),

    default_currency_code: z.string().trim().optional(),

    payment_terms: z.string().trim().optional(),
    bank_name: z.string().trim().optional(),
    bank_branch: z.string().trim().optional(),
    account_holder_name: z.string().trim().optional(),
    account_number: z.string().trim().optional(),
    account_type: z.string().trim().optional(),
    ifsc_code: z.string().trim().optional(),
    swift_code: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    status: z.string().trim().optional(),
    is_active: z.boolean().optional(),

    contacts: z.array(
      z.object({
        uuid: z.string().trim().optional(),
        contact_type: z.string().trim().min(1, t('validation.fieldRequired')),
        contact_name: z.string().trim().min(1, t('validation.nameRequired')),
        phone: z.string().trim().optional(),
        email: z.string().trim().optional(),
      }),
    ),
  });

export type VendorSchema = ReturnType<typeof getVendorSchema>;
