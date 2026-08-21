// src/features/settings/taxCode/taxCode.api.ts
import api from "../../../services/api";

import type {
  TaxCodeDetail,
  TaxCodeFormInput,
  TaxCodeListApiResponse,
  GetTaxCodesParams,
  TaxCodeBulkActionResult,
} from "./taxCode.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createTaxCode(payload: TaxCodeFormInput) {
  const { data } = await api.post("/api/v1/tax-codes", cleanPayload(payload));
  return data;
}

export async function getTaxCodes(
  params: GetTaxCodesParams,
  signal?: AbortSignal,
): Promise<TaxCodeListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<TaxCodeListApiResponse>("/api/v1/tax-codes", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getTaxCodeByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<TaxCodeDetail> {
  const { data } = await api.get<TaxCodeDetail>(`/api/v1/tax-codes/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateTaxCodeByUuid(
  uuid: string,
  payload: TaxCodeFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/tax-codes/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteTaxCodeByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/tax-codes/${uuid}`);
  return data;
}

export async function restoreTaxCodeByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/tax-codes/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteTaxCodes(uuids: string[]): Promise<TaxCodeBulkActionResult> {
  const { data } = await api.post<TaxCodeBulkActionResult>("/api/v1/tax-codes/bulk-delete", {
    tax_code_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreTaxCodes(uuids: string[]): Promise<TaxCodeBulkActionResult> {
  const { data } = await api.post<TaxCodeBulkActionResult>("/api/v1/tax-codes/bulk-restore", {
    tax_code_uuids: uuids,
  });
  return data;
}
