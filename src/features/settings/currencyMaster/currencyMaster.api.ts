// src/features/settings/currencyMaster/currencyMaster.api.ts
import api from "../../../services/api";

import type {
  CurrencyMasterDetail,
  CurrencyMasterFormInput,
  CurrencyMasterListApiResponse,
  GetCurrencyMastersParams,
  CurrencyMasterBulkActionResult,
} from "./currencyMaster.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createCurrencyMaster(payload: CurrencyMasterFormInput) {
  const { data } = await api.post("/api/v1/currency-masters", cleanPayload(payload));
  return data;
}

export async function getCurrencyMasters(
  params: GetCurrencyMastersParams,
  signal?: AbortSignal,
): Promise<CurrencyMasterListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<CurrencyMasterListApiResponse>("/api/v1/currency-masters", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getCurrencyMasterByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<CurrencyMasterDetail> {
  const { data } = await api.get<CurrencyMasterDetail>(`/api/v1/currency-masters/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateCurrencyMasterByUuid(
  uuid: string,
  payload: CurrencyMasterFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/currency-masters/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteCurrencyMasterByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/currency-masters/${uuid}`);
  return data;
}

export async function restoreCurrencyMasterByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/currency-masters/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteCurrencyMasters(uuids: string[]): Promise<CurrencyMasterBulkActionResult> {
  const { data } = await api.post<CurrencyMasterBulkActionResult>("/api/v1/currency-masters/bulk-delete", {
    currency_master_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreCurrencyMasters(uuids: string[]): Promise<CurrencyMasterBulkActionResult> {
  const { data } = await api.post<CurrencyMasterBulkActionResult>("/api/v1/currency-masters/bulk-restore", {
    currency_master_uuids: uuids,
  });
  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importCurrencyMastersFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportResult>("/api/v1/currency-masters/import", formData);

  return data;
}
