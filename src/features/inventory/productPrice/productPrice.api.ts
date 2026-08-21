// src/features/inventory/productPrice/productPrice.api.ts
import api from "../../../services/api";

import type {
  ProductPriceDetail,
  ProductPriceFormInput,
  ProductPriceListApiResponse,
  GetProductPricesParams,
  ProductPriceBulkActionResult,
} from "./productPrice.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createProductPrice(payload: ProductPriceFormInput) {
  const { data } = await api.post("/api/v1/product-prices", cleanPayload(payload));
  return data;
}

export async function getProductPrices(
  params: GetProductPricesParams,
  signal?: AbortSignal,
): Promise<ProductPriceListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<ProductPriceListApiResponse>("/api/v1/product-prices", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getProductPriceByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<ProductPriceDetail> {
  const { data } = await api.get<ProductPriceDetail>(`/api/v1/product-prices/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateProductPriceByUuid(
  uuid: string,
  payload: ProductPriceFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/product-prices/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteProductPriceByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/product-prices/${uuid}`);
  return data;
}

export async function restoreProductPriceByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/product-prices/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteProductPrices(uuids: string[]): Promise<ProductPriceBulkActionResult> {
  const { data } = await api.post<ProductPriceBulkActionResult>("/api/v1/product-prices/bulk-delete", {
    product_price_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreProductPrices(uuids: string[]): Promise<ProductPriceBulkActionResult> {
  const { data } = await api.post<ProductPriceBulkActionResult>("/api/v1/product-prices/bulk-restore", {
    product_price_uuids: uuids,
  });
  return data;
}
