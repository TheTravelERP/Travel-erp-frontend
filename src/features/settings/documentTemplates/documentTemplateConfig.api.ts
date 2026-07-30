// src/features/settings/documentTemplates/documentTemplateConfig.api.ts
import api from "../../../services/api";

import type {
  DocumentTemplateConfigDetail,
  DocumentTemplateConfigFormInput,
  DocumentTemplateConfigListApiResponse,
  GetDocumentTemplateConfigsParams,
} from "./documentTemplateConfig.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createDocumentTemplateConfig(payload: DocumentTemplateConfigFormInput) {
  const { data } = await api.post("/api/v1/document-template-configs", cleanPayload(payload));
  return data;
}

export async function getDocumentTemplateConfigsList(
  params: GetDocumentTemplateConfigsParams,
  signal?: AbortSignal,
): Promise<DocumentTemplateConfigListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<DocumentTemplateConfigListApiResponse>("/api/v1/document-template-configs", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getDocumentTemplateConfigByUuid(uuid: string): Promise<DocumentTemplateConfigDetail> {
  const { data } = await api.get<DocumentTemplateConfigDetail>(`/api/v1/document-template-configs/${uuid}`);
  return data;
}

export async function updateDocumentTemplateConfigByUuid(
  uuid: string,
  payload: DocumentTemplateConfigFormInput,
) {
  const { data } = await api.put(`/api/v1/document-template-configs/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteDocumentTemplateConfigByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/document-template-configs/${uuid}`);
  return data;
}

export async function restoreDocumentTemplateConfigByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/document-template-configs/${uuid}/restore`);
  return data;
}

export async function previewDocumentTemplateConfig(
  uuid: string,
  overrides: Partial<DocumentTemplateConfigFormInput>,
): Promise<Blob> {
  const { data } = await api.post(`/api/v1/document-template-configs/${uuid}/preview`, overrides, {
    responseType: "blob",
  });
  return data;
}
