// src/features/settings/documentTemplates/documentTemplateSettings.types.ts

export type PaperSize = "A4" | "Letter";
export type Orientation = "Portrait" | "Landscape";
export type PageNumberPosition = "Header" | "Footer" | "None";

export interface DocumentTemplateSettings {
  org_id: number;

  show_logo: boolean;
  show_header_banner: boolean;
  show_footer_banner: boolean;
  show_signature: boolean;
  show_stamp: boolean;
  show_qr_code: boolean;
  show_watermark: boolean;

  header_text: string | null;
  footer_text: string | null;
  terms_conditions: string | null;
  default_notes: string | null;

  paper_size: PaperSize;
  orientation: Orientation;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;

  show_page_number: boolean;
  page_number_position: PageNumberPosition;
  show_generated_by: boolean;
  show_print_date: boolean;

  version_no: number;
}

export type DocumentTemplateSettingsUpdate = Partial<
  Omit<DocumentTemplateSettings, "org_id" | "version_no">
> & { version_no: number };
