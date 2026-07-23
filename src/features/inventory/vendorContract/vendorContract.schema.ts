// src/features/inventory/vendorContract/vendorContract.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getVendorContractSchema = (t: TFunction) =>
  z
    .object({
      vendor_uuid: z.string().trim().min(1, t('vendorContract.validation.vendorRequired')),
      contract_code: z.string().trim().min(1, t('validation.codeRequired')).max(30),
      contract_name: z.string().trim().min(1, t('validation.nameRequired')).max(200),
      contract_type: z.string().trim().optional(),
      reference_no: z.string().trim().optional(),
      valid_from: z.string().trim().optional(),
      valid_to: z.string().trim().optional(),
      currency_code: z.string().trim().optional(),
      payment_terms: z.string().trim().optional(),
      remarks: z.string().trim().optional(),
      status: z.string().trim().optional(),
      is_active: z.boolean().optional(),
    })
    .refine(
      (data) => !data.valid_from || !data.valid_to || data.valid_to >= data.valid_from,
      {
        message: t('vendorContract.validation.validToBeforeValidFrom'),
        path: ['valid_to'],
      },
    );

export type VendorContractSchema = ReturnType<typeof getVendorContractSchema>;
