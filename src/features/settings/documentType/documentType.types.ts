// src/features/settings/documentType/documentType.types.ts

export interface DocumentTypeFormInput {
  document_code: string;
  document_name: string;
  default_prefix?: string;
  module_name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface DocumentTypeDetail extends DocumentTypeFormInput {
  uuid: string;
  is_system: boolean;
  version_no: number;
}

export interface DocumentTypeListItem {
  uuid: string;
  document_code: string;
  document_name: string;
  default_prefix?: string;
  module_name: string;
  is_system: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GetDocumentTypesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
  module_name?: string;
  is_system?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface DocumentTypeListApiResponse {
  data: DocumentTypeListItem[];
  pagination: Pagination;
}

export interface DocumentTypeBulkActionResult {
  message: string;
  count: number;
}
