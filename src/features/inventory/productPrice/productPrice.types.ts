// src/features/inventory/productPrice/productPrice.types.ts

export interface ProductPriceFormInput {
  product_uuid: string;
  price_code: string;
  valid_from: string;
  valid_to: string;
  currency_code: string;
  cost_price: string;
  sell_price: string;
  tax_treatment?: string;
  remarks?: string;
  is_active?: boolean;

  // Tax Configuration (Tax Foundation Reconciliation phase) — a real FK
  // into the Tax Code master, not free-text fields re-entered per row.
  // Optional as a whole: when set, cost_tax_mode/sell_tax_mode default to
  // "system_default" if omitted (resolved server-side).
  tax_code_uuid?: string;
  cost_tax_mode?: string;
  sell_tax_mode?: string;
}

export interface ProductPriceDetail extends ProductPriceFormInput {
  uuid: string;
  product_code?: string;
  product_name?: string;
  currency_name?: string;
  version_no: number;

  // Tax Code identity, resolved through the FK — read-only display fields.
  tax_code_code?: string;
  tax_code_name?: string;
  tax_code_rate?: string;
  tax_code_tax_type?: string;

  // What "system_default" actually resolved to, for display transparency.
  effective_cost_tax_mode?: string;
  effective_sell_tax_mode?: string;

  // Computed breakdown — read-only, returned by the backend, never sent
  // back on write.
  cost_net_price?: string;
  cost_tax_amount?: string;
  cost_gross_price?: string;
  sell_net_price?: string;
  sell_tax_amount?: string;
  sell_gross_price?: string;
}

export interface ProductPriceListItem {
  uuid: string;
  product_uuid?: string;
  product_code?: string;
  product_name?: string;
  price_code: string;
  valid_from: string;
  valid_to: string;
  currency_code: string;
  cost_price: string;
  sell_price: string;
  is_active: boolean;
  created_at: string;
}

export interface GetProductPricesParams {
  page?: number;
  page_size?: number;
  search?: string;
  product_uuid?: string;
  currency_code?: string;
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

export interface ProductPriceListApiResponse {
  data: ProductPriceListItem[];
  pagination: Pagination;
}

export interface ProductPriceBulkActionResult {
  message: string;
  count: number;
}
