// src/features/settings/branch/branch.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { MOBILE_NUMBER_REGEX } from '../../../utils/validator';

const optionalMobile = (t: TFunction) =>
  z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || MOBILE_NUMBER_REGEX.test(value), {
      message: t('validation.internationalMobile'),
    });

export const getBranchSchema = (t: TFunction) =>
  z
    .object({
      branch_code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
      branch_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
      legal_name: z.string().trim().optional(),
      // Optional — omit to inherit the organization's own Localization
      // Profile (the backend always resolves this to a concrete FK, never
      // leaves it null).
      localization_profile_uuid: z.string().trim().optional(),
      contact_person_name: z.string().trim().max(150).optional(),
      manager_uuid: z.string().trim().optional(),
      office_phone: optionalMobile(t),
      emergency_phone: optionalMobile(t),
      whatsapp_number: optionalMobile(t),
      email: z.string().trim().optional(),
      website: z.string().trim().optional(),
      address_line1: z.string().trim().optional(),
      address_line2: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
      postal_code: z.string().trim().optional(),
      latitude: z.coerce.number().min(-90).max(90).optional(),
      longitude: z.coerce.number().min(-180).max(180).optional(),
      working_from: z.string().trim().optional(),
      working_to: z.string().trim().optional(),
      remarks: z.string().trim().optional(),
      is_active: z.boolean().optional(),
    })
    .refine(
      (data) => !data.working_from || !data.working_to || data.working_from < data.working_to,
      {
        message: t('validation.endTimeBeforeStartTime'),
        path: ['working_to'],
      },
    );

export type BranchSchema = ReturnType<typeof getBranchSchema>;
