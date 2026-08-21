// src/features/inventory/product/product.types.ts

export interface ProductFormInput {
  product_code: string;
  product_name: string;
  description?: string;
  location_uuid: string;
  service_type_uuid: string;
  vendor_uuid: string;
  is_active?: boolean;
}

export interface ProductDetail extends ProductFormInput {
  uuid: string;
  location_code?: string;
  location_name?: string;
  service_type_code?: string;
  service_type_name?: string;
  vendor_code?: string;
  vendor_name?: string;
  version_no: number;
}

export interface ProductListItem {
  uuid: string;
  product_code: string;
  product_name: string;
  location_uuid?: string;
  location_name?: string;
  service_type_uuid?: string;
  service_type_name?: string;
  vendor_uuid?: string;
  vendor_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetProductsParams {
  page?: number;
  page_size?: number;
  search?: string;
  location_uuid?: string;
  service_type_uuid?: string;
  vendor_uuid?: string;
  is_active?: string;
  from_date?: string;
  to_date?: string;
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

export interface ProductListApiResponse {
  data: ProductListItem[];
  pagination: Pagination;
}

export interface ProductBulkActionResult {
  message: string;
  count: number;
}
