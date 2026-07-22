// src/features/inventory/transportCompany/transportCompany.api.ts
import api from "../../../services/api";

import type {
  TransportCompanyDetail,
  TransportCompanyFormInput,
  TransportCompanyListApiResponse,
  GetTransportCompaniesParams,
  TransportCompanyBulkActionResult,
} from "./transportCompany.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createTransportCompany(payload: TransportCompanyFormInput) {
  const { data } = await api.post("/api/v1/transport-companies", cleanPayload(payload));
  return data;
}

export async function getTransportCompanies(
  params: GetTransportCompaniesParams,
  signal?: AbortSignal,
): Promise<TransportCompanyListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<TransportCompanyListApiResponse>("/api/v1/transport-companies", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getTransportCompanyByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<TransportCompanyDetail> {
  const { data } = await api.get<TransportCompanyDetail>(`/api/v1/transport-companies/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateTransportCompanyByUuid(
  uuid: string,
  payload: TransportCompanyFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/transport-companies/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteTransportCompanyByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/transport-companies/${uuid}`);
  return data;
}

export async function restoreTransportCompanyByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/transport-companies/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteTransportCompanies(uuids: string[]): Promise<TransportCompanyBulkActionResult> {
  const { data } = await api.post<TransportCompanyBulkActionResult>("/api/v1/transport-companies/bulk-delete", {
    transport_company_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreTransportCompanies(uuids: string[]): Promise<TransportCompanyBulkActionResult> {
  const { data } = await api.post<TransportCompanyBulkActionResult>("/api/v1/transport-companies/bulk-restore", {
    transport_company_uuids: uuids,
  });
  return data;
}
