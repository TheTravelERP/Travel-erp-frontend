// src/features/settings/currencyRatePolicy/currencyRatePolicy.api.ts
import api from "../../../services/api";

import type {
  CurrencyRatePolicyDetail,
  CurrencyRatePolicyFormInput,
  CurrencyRatePolicyListApiResponse,
  GetCurrencyRatePoliciesParams,
  CurrencyRatePolicyBulkActionResult,
} from "./currencyRatePolicy.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createCurrencyRatePolicy(payload: CurrencyRatePolicyFormInput) {
  const { data } = await api.post("/api/v1/currency-rate-policies", cleanPayload(payload));
  return data;
}

export async function getCurrencyRatePolicies(
  params: GetCurrencyRatePoliciesParams,
  signal?: AbortSignal,
): Promise<CurrencyRatePolicyListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<CurrencyRatePolicyListApiResponse>("/api/v1/currency-rate-policies", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getCurrencyRatePolicyByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<CurrencyRatePolicyDetail> {
  const { data } = await api.get<CurrencyRatePolicyDetail>(`/api/v1/currency-rate-policies/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateCurrencyRatePolicyByUuid(
  uuid: string,
  payload: CurrencyRatePolicyFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/currency-rate-policies/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteCurrencyRatePolicyByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/currency-rate-policies/${uuid}`);
  return data;
}

export async function restoreCurrencyRatePolicyByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/currency-rate-policies/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteCurrencyRatePolicies(uuids: string[]): Promise<CurrencyRatePolicyBulkActionResult> {
  const { data } = await api.post<CurrencyRatePolicyBulkActionResult>("/api/v1/currency-rate-policies/bulk-delete", {
    org_currency_rate_policy_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreCurrencyRatePolicies(uuids: string[]): Promise<CurrencyRatePolicyBulkActionResult> {
  const { data } = await api.post<CurrencyRatePolicyBulkActionResult>("/api/v1/currency-rate-policies/bulk-restore", {
    org_currency_rate_policy_uuids: uuids,
  });
  return data;
}
