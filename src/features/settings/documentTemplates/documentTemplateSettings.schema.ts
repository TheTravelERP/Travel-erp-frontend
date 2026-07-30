// src/features/settings/documentTemplates/documentTemplateSettings.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

const PAPER_SIZES = ["A4", "Letter"] as const;
const ORIENTATIONS = ["Portrait", "Landscape"] as const;
const PAGE_NUMBER_POSITIONS = ["Header", "Footer", "None"] as const;

export const getDocumentTemplateSettingsSchema = (t: TFunction) =>
  z.object({
    show_logo: z.boolean().optional(),
    show_header_banner: z.boolean().optional(),
    show_footer_banner: z.boolean().optional(),
    show_signature: z.boolean().optional(),
    show_stamp: z.boolean().optional(),
    show_qr_code: z.boolean().optional(),
    show_watermark: z.boolean().optional(),

    header_text: z.string().nullable().optional(),
    footer_text: z.string().nullable().optional(),
    terms_conditions: z.string().nullable().optional(),
    default_notes: z.string().nullable().optional(),

    paper_size: z.enum(PAPER_SIZES).optional(),
    orientation: z.enum(ORIENTATIONS).optional(),
    margin_top: z.coerce.number().min(0, t('documentTemplateConfig.validation.marginNonNegative')).optional(),
    margin_bottom: z.coerce.number().min(0, t('documentTemplateConfig.validation.marginNonNegative')).optional(),
    margin_left: z.coerce.number().min(0, t('documentTemplateConfig.validation.marginNonNegative')).optional(),
    margin_right: z.coerce.number().min(0, t('documentTemplateConfig.validation.marginNonNegative')).optional(),

    show_page_number: z.boolean().optional(),
    page_number_position: z.enum(PAGE_NUMBER_POSITIONS).optional(),
    show_generated_by: z.boolean().optional(),
    show_print_date: z.boolean().optional(),

    version_no: z.number(),
  });

export type DocumentTemplateSettingsSchema = ReturnType<typeof getDocumentTemplateSettingsSchema>;
