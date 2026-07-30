// src/features/settings/documentTemplates/documentTemplateConfig.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

const PAPER_SIZES = ["A4", "Letter"] as const;
const ORIENTATIONS = ["Portrait", "Landscape"] as const;
const PAGE_NUMBER_POSITIONS = ["Header", "Footer", "None"] as const;
const QR_PURPOSES = ["Payment", "Verification", "Website", "DynamicURL"] as const;
const SIGNATURE_POSITIONS = ["Left", "Center", "Right", "Hidden"] as const;

export const getDocumentTemplateConfigSchema = (t: TFunction) =>
  z.object({
    document_type_uuid: z.string().trim().min(1, t('documentTemplateConfig.validation.documentTypeRequired')),

    show_logo: z.boolean().nullable().optional(),
    show_header_banner: z.boolean().nullable().optional(),
    show_footer_banner: z.boolean().nullable().optional(),
    show_signature: z.boolean().nullable().optional(),
    show_stamp: z.boolean().nullable().optional(),
    show_qr_code: z.boolean().nullable().optional(),
    show_watermark: z.boolean().nullable().optional(),

    header_text: z.string().nullable().optional(),
    footer_text: z.string().nullable().optional(),
    terms_conditions: z.string().nullable().optional(),
    default_notes: z.string().nullable().optional(),

    paper_size: z.enum(PAPER_SIZES).nullable().optional(),
    orientation: z.enum(ORIENTATIONS).nullable().optional(),
    margin_top: z.coerce.number().nullable().optional(),
    margin_bottom: z.coerce.number().nullable().optional(),
    margin_left: z.coerce.number().nullable().optional(),
    margin_right: z.coerce.number().nullable().optional(),

    show_page_number: z.boolean().nullable().optional(),
    page_number_position: z.enum(PAGE_NUMBER_POSITIONS).nullable().optional(),
    show_generated_by: z.boolean().nullable().optional(),
    show_print_date: z.boolean().nullable().optional(),

    qr_purpose: z.enum(QR_PURPOSES).nullable().optional(),
    watermark_opacity: z.coerce.number().min(0).max(1).nullable().optional(),
    watermark_position: z.string().nullable().optional(),
    watermark_scale: z.coerce.number().nullable().optional(),
    watermark_rotation: z.coerce.number().int().nullable().optional(),
    signature_position: z.enum(SIGNATURE_POSITIONS).nullable().optional(),

    is_active: z.boolean().optional(),
  });

export type DocumentTemplateConfigSchema = ReturnType<typeof getDocumentTemplateConfigSchema>;
