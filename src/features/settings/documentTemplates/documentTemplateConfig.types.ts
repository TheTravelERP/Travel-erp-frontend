// src/features/settings/documentTemplates/documentTemplateConfig.types.ts

export type PaperSize = "A4" | "Letter";
export type Orientation = "Portrait" | "Landscape";
export type PageNumberPosition = "Header" | "Footer" | "None";
export type QrPurpose = "Payment" | "Verification" | "Website" | "DynamicURL";
export type SignaturePosition = "Left" | "Center" | "Right" | "Hidden";

export interface DocumentTemplateConfigFormInput {
  document_type_uuid: string;

  show_logo?: boolean | null;
  show_header_banner?: boolean | null;
  show_footer_banner?: boolean | null;
  show_signature?: boolean | null;
  show_stamp?: boolean | null;
  show_qr_code?: boolean | null;
  show_watermark?: boolean | null;

  header_text?: string | null;
  footer_text?: string | null;
  terms_conditions?: string | null;
  default_notes?: string | null;

  paper_size?: PaperSize | null;
  orientation?: Orientation | null;
  margin_top?: number | null;
  margin_bottom?: number | null;
  margin_left?: number | null;
  margin_right?: number | null;

  show_page_number?: boolean | null;
  page_number_position?: PageNumberPosition | null;
  show_generated_by?: boolean | null;
  show_print_date?: boolean | null;

  qr_purpose?: QrPurpose | null;
  watermark_opacity?: number | null;
  watermark_position?: string | null;
  watermark_scale?: number | null;
  watermark_rotation?: number | null;
  signature_position?: SignaturePosition | null;

  is_active?: boolean;
}

export interface DocumentTemplateConfigDetail extends DocumentTemplateConfigFormInput {
  uuid: string;
  document_type_code: string;
  document_type_name: string;
  version_no: number;
  created_at: string;
}

export interface DocumentTemplateConfigListItem {
  uuid: string;
  document_type_uuid: string;
  document_type_code: string;
  document_type_name: string;
  paper_size?: string | null;
  orientation?: string | null;
  show_watermark?: boolean | null;
  is_active: boolean;
  created_at: string;
}

export interface GetDocumentTemplateConfigsParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface DocumentTemplateConfigListApiResponse {
  data: DocumentTemplateConfigListItem[];
  pagination: Pagination;
}
