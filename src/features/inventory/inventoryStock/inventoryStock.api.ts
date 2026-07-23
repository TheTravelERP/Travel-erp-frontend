// src/features/inventory/inventoryStock/inventoryStock.api.ts
import api from "../../../services/api";

import type {
  InventoryStockDetail,
  InventoryStockFormInput,
  InventoryStockListApiResponse,
  GetInventoryStocksParams,
  InventoryStockBulkActionResult,
} from "./inventoryStock.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createInventoryStock(payload: InventoryStockFormInput) {
  const { data } = await api.post("/api/v1/inventory-stock", cleanPayload(payload));
  return data;
}

export async function getInventoryStocks(
  params: GetInventoryStocksParams,
  signal?: AbortSignal,
): Promise<InventoryStockListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<InventoryStockListApiResponse>("/api/v1/inventory-stock", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getInventoryStockByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<InventoryStockDetail> {
  const { data } = await api.get<InventoryStockDetail>(`/api/v1/inventory-stock/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateInventoryStockByUuid(
  uuid: string,
  payload: InventoryStockFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/inventory-stock/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteInventoryStockByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/inventory-stock/${uuid}`);
  return data;
}

export async function restoreInventoryStockByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/inventory-stock/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteInventoryStocks(uuids: string[]): Promise<InventoryStockBulkActionResult> {
  const { data } = await api.post<InventoryStockBulkActionResult>("/api/v1/inventory-stock/bulk-delete", {
    inventory_stock_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreInventoryStocks(uuids: string[]): Promise<InventoryStockBulkActionResult> {
  const { data } = await api.post<InventoryStockBulkActionResult>("/api/v1/inventory-stock/bulk-restore", {
    inventory_stock_uuids: uuids,
  });
  return data;
}
