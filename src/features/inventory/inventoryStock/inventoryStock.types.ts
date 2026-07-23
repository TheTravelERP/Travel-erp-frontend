// src/features/inventory/inventoryStock/inventoryStock.types.ts

export interface InventoryStockFormInput {
  contract_uuid: string;
  inventory_code: string;
  inventory_name: string;
  service_type?: string;
  hotel_uuid?: string;
  airline_uuid?: string;
  ziyarat_uuid?: string;
  vendor_uuid?: string;
  start_date?: string;
  end_date?: string;
  total_qty: number;
  booked_qty?: number;
  blocked_qty?: number;
  cost_price?: number;
  selling_price?: number;
  currency_code?: string;
  remarks?: string;
  status?: string;
  is_active?: boolean;
}

export interface InventoryStockDetail extends InventoryStockFormInput {
  uuid: string;
  contract_code?: string;
  contract_name?: string;
  hotel_name?: string;
  airline_name?: string;
  ziyarat_name?: string;
  vendor_name?: string;
  available_qty: number;
  version_no: number;
}

export interface InventoryStockListItem {
  uuid: string;
  inventory_code: string;
  inventory_name: string;
  service_type?: string;
  contract_uuid?: string;
  contract_code?: string;
  vendor_name?: string;
  service_reference_name?: string;
  start_date?: string;
  end_date?: string;
  total_qty: number;
  booked_qty: number;
  blocked_qty: number;
  available_qty: number;
  status?: string;
  is_active: boolean;
  created_at: string;
}

export interface GetInventoryStocksParams {
  page?: number;
  page_size?: number;
  search?: string;
  service_type?: string;
  contract_uuid?: string;
  status?: string;
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

export interface InventoryStockListApiResponse {
  data: InventoryStockListItem[];
  pagination: Pagination;
}

export interface InventoryStockBulkActionResult {
  message: string;
  count: number;
}
