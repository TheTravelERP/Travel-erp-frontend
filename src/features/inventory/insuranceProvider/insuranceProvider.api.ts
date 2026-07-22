// src/features/inventory/insuranceProvider/insuranceProvider.api.ts
import api from "../../../services/api";

import type {
  InsuranceProviderDetail,
  InsuranceProviderFormInput,
  InsuranceProviderListApiResponse,
  GetInsuranceProvidersParams,
  InsuranceProviderBulkActionResult,
} from "./insuranceProvider.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createInsuranceProvider(payload: InsuranceProviderFormInput) {
  const { data } = await api.post("/api/v1/insurance-providers", cleanPayload(payload));
  return data;
}

export async function getInsuranceProviders(
  params: GetInsuranceProvidersParams,
  signal?: AbortSignal,
): Promise<InsuranceProviderListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<InsuranceProviderListApiResponse>("/api/v1/insurance-providers", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getInsuranceProviderByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<InsuranceProviderDetail> {
  const { data } = await api.get<InsuranceProviderDetail>(`/api/v1/insurance-providers/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateInsuranceProviderByUuid(
  uuid: string,
  payload: InsuranceProviderFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/insurance-providers/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteInsuranceProviderByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/insurance-providers/${uuid}`);
  return data;
}

export async function restoreInsuranceProviderByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/insurance-providers/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteInsuranceProviders(uuids: string[]): Promise<InsuranceProviderBulkActionResult> {
  const { data } = await api.post<InsuranceProviderBulkActionResult>("/api/v1/insurance-providers/bulk-delete", {
    insurance_provider_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreInsuranceProviders(uuids: string[]): Promise<InsuranceProviderBulkActionResult> {
  const { data } = await api.post<InsuranceProviderBulkActionResult>("/api/v1/insurance-providers/bulk-restore", {
    insurance_provider_uuids: uuids,
  });
  return data;
}
