// src/features/settings/communicationProviders/communicationProvider.api.ts
import api from "../../../services/api";

import type {
  CommunicationProviderDetail,
  CommunicationProviderFormInput,
  CommunicationProviderListApiResponse,
  GetCommunicationProvidersParams,
  CommunicationProviderBulkActionResult,
  TestProviderResult,
} from "./communicationProvider.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createCommunicationProvider(payload: CommunicationProviderFormInput) {
  const { data } = await api.post("/api/v1/communication-providers", cleanPayload(payload));
  return data;
}

export async function getCommunicationProviders(
  params: GetCommunicationProvidersParams,
  signal?: AbortSignal,
): Promise<CommunicationProviderListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<CommunicationProviderListApiResponse>("/api/v1/communication-providers", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getCommunicationProviderByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<CommunicationProviderDetail> {
  const { data } = await api.get<CommunicationProviderDetail>(`/api/v1/communication-providers/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateCommunicationProviderByUuid(
  uuid: string,
  payload: CommunicationProviderFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/communication-providers/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteCommunicationProviderByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/communication-providers/${uuid}`);
  return data;
}

export async function restoreCommunicationProviderByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/communication-providers/${uuid}/restore`, {});
  return data;
}

export async function setDefaultCommunicationProvider(uuid: string): Promise<CommunicationProviderDetail> {
  const { data } = await api.post(`/api/v1/communication-providers/${uuid}/set-default`, {});
  return data;
}

export async function testCommunicationProvider(
  uuid: string,
  testRecipient?: string,
): Promise<TestProviderResult> {
  const { data } = await api.post<TestProviderResult>(`/api/v1/communication-providers/${uuid}/test-connection`, {
    test_recipient: testRecipient || undefined,
  });
  return data;
}

export async function bulkDeleteCommunicationProviders(uuids: string[]): Promise<CommunicationProviderBulkActionResult> {
  const { data } = await api.post<CommunicationProviderBulkActionResult>("/api/v1/communication-providers/bulk-delete", {
    provider_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreCommunicationProviders(uuids: string[]): Promise<CommunicationProviderBulkActionResult> {
  const { data } = await api.post<CommunicationProviderBulkActionResult>("/api/v1/communication-providers/bulk-restore", {
    provider_uuids: uuids,
  });
  return data;
}
