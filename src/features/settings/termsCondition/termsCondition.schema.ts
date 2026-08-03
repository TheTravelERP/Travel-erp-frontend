// src/features/settings/termsCondition/termsCondition.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getTermsConditionSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().max(30).optional(),
    title: z.string().trim().min(1, t('validation.nameRequired')).max(200),
    document_type_uuid: z.string().trim().min(1, t('termsConditions.validation.documentTypeRequired')),
    terms_text: z.string().trim().min(1, t('termsConditions.validation.termsTextRequired')),
    is_default: z.boolean().optional(),
    remarks: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type TermsConditionSchema = ReturnType<typeof getTermsConditionSchema>;
