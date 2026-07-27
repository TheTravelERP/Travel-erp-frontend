// src/features/settings/exchangeRate/exchangeRate.api.ts
import api from "../../../services/api";

import type {
  ExchangeRateDetail,
  ExchangeRateFormInput,
  ExchangeRateListApiResponse,
  GetExchangeRatesParams,
  ExchangeRateBulkActionResult,
} from "./exchangeRate.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createExchangeRate(payload: ExchangeRateFormInput) {
  const { data } = await api.post("/api/v1/exchange-rates", cleanPayload(payload));
  return data;
}

export async function getExchangeRates(
  params: GetExchangeRatesParams,
  signal?: AbortSignal,
): Promise<ExchangeRateListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<ExchangeRateListApiResponse>("/api/v1/exchange-rates", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getExchangeRateByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<ExchangeRateDetail> {
  const { data } = await api.get<ExchangeRateDetail>(`/api/v1/exchange-rates/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateExchangeRateByUuid(
  uuid: string,
  payload: ExchangeRateFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/exchange-rates/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteExchangeRateByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/exchange-rates/${uuid}`);
  return data;
}

export async function restoreExchangeRateByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/exchange-rates/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteExchangeRates(uuids: string[]): Promise<ExchangeRateBulkActionResult> {
  const { data } = await api.post<ExchangeRateBulkActionResult>("/api/v1/exchange-rates/bulk-delete", {
    exchange_rate_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreExchangeRates(uuids: string[]): Promise<ExchangeRateBulkActionResult> {
  const { data } = await api.post<ExchangeRateBulkActionResult>("/api/v1/exchange-rates/bulk-restore", {
    exchange_rate_uuids: uuids,
  });
  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importExchangeRatesFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportResult>("/api/v1/exchange-rates/import", formData);

  return data;
}
