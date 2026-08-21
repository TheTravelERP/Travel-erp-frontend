// src/features/settings/serviceType/serviceType.api.ts
import api from "../../../services/api";

import type {
  ServiceTypeDetail,
  ServiceTypeFormInput,
  ServiceTypeListApiResponse,
  GetServiceTypesParams,
  ServiceTypeBulkActionResult,
} from "./serviceType.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createServiceType(payload: ServiceTypeFormInput) {
  const { data } = await api.post("/api/v1/service-types", cleanPayload(payload));
  return data;
}

export async function getServiceTypes(
  params: GetServiceTypesParams,
  signal?: AbortSignal,
): Promise<ServiceTypeListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<ServiceTypeListApiResponse>("/api/v1/service-types", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getServiceTypeByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<ServiceTypeDetail> {
  const { data } = await api.get<ServiceTypeDetail>(`/api/v1/service-types/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateServiceTypeByUuid(
  uuid: string,
  payload: ServiceTypeFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/service-types/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteServiceTypeByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/service-types/${uuid}`);
  return data;
}

export async function restoreServiceTypeByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/service-types/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteServiceTypes(uuids: string[]): Promise<ServiceTypeBulkActionResult> {
  const { data } = await api.post<ServiceTypeBulkActionResult>("/api/v1/service-types/bulk-delete", {
    service_type_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreServiceTypes(uuids: string[]): Promise<ServiceTypeBulkActionResult> {
  const { data } = await api.post<ServiceTypeBulkActionResult>("/api/v1/service-types/bulk-restore", {
    service_type_uuids: uuids,
  });
  return data;
}
