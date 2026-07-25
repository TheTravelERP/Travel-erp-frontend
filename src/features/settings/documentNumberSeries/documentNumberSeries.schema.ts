// src/features/settings/documentNumberSeries/documentNumberSeries.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

const RESET_POLICIES = ["Never", "Daily", "Weekly", "Monthly", "Yearly", "Financial Year"] as const;

export const getDocumentNumberSeriesSchema = (t: TFunction) =>
  z.object({
    branch_uuid: z.string().trim().min(1, t('validation.branchRequired')),
    document_type_uuid: z.string().trim().min(1, t('documentNumberSeries.validation.documentTypeRequired')),
    series_name: z.string().trim().min(1, t('validation.nameRequired')).max(100),
    prefix: z.string().trim().max(50).optional(),
    suffix: z.string().trim().max(50).optional(),
    separator: z.string().trim().max(10).optional(),
    number_length: z.coerce.number().int().min(1, t('documentNumberSeries.validation.numberLengthMin')).optional(),
    starting_number: z.coerce.number().int().gt(0, t('documentNumberSeries.validation.startingNumberPositive')).optional(),
    reset_policy: z.enum(RESET_POLICIES).optional(),
    is_default: z.boolean().optional(),
    effective_from: z.string().trim().optional(),
    effective_to: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  }).refine(
    (data) => !data.effective_from || !data.effective_to || data.effective_from <= data.effective_to,
    {
      message: t('validation.endDateBeforeStartDate'),
      path: ['effective_to'],
    },
  );

export type DocumentNumberSeriesSchema = ReturnType<typeof getDocumentNumberSeriesSchema>;
