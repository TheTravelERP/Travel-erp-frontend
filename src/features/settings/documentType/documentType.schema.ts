// src/features/settings/documentType/documentType.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getDocumentTypeSchema = (t: TFunction) =>
  z.object({
    document_code: z.string().trim().min(1, t('validation.codeRequired')).max(20),
    document_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
    default_prefix: z.string().trim().max(20).optional(),
    module_name: z.string().trim().min(1, t('documentType.validation.moduleRequired')).max(100),
    description: z.string().trim().optional(),
    sort_order: z.coerce.number().int().optional(),
    is_active: z.boolean().optional(),
  });

export type DocumentTypeSchema = ReturnType<typeof getDocumentTypeSchema>;
