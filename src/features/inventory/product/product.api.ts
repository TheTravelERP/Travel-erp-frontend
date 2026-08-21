// src/features/inventory/product/product.api.ts
import api from "../../../services/api";

import type {
  ProductDetail,
  ProductFormInput,
  ProductListApiResponse,
  GetProductsParams,
  ProductBulkActionResult,
} from "./product.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createProduct(payload: ProductFormInput) {
  const { data } = await api.post("/api/v1/products", cleanPayload(payload));
  return data;
}

export async function getProducts(
  params: GetProductsParams,
  signal?: AbortSignal,
): Promise<ProductListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<ProductListApiResponse>("/api/v1/products", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getProductByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/v1/products/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateProductByUuid(
  uuid: string,
  payload: ProductFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/products/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteProductByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/products/${uuid}`);
  return data;
}

export async function restoreProductByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/products/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteProducts(uuids: string[]): Promise<ProductBulkActionResult> {
  const { data } = await api.post<ProductBulkActionResult>("/api/v1/products/bulk-delete", {
    product_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreProducts(uuids: string[]): Promise<ProductBulkActionResult> {
  const { data } = await api.post<ProductBulkActionResult>("/api/v1/products/bulk-restore", {
    product_uuids: uuids,
  });
  return data;
}
