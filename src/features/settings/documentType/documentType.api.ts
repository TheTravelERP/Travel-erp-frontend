// src/features/settings/documentType/documentType.api.ts
import api from "../../../services/api";

import type {
  DocumentTypeDetail,
  DocumentTypeFormInput,
  DocumentTypeListApiResponse,
  GetDocumentTypesParams,
  DocumentTypeBulkActionResult,
} from "./documentType.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createDocumentType(payload: DocumentTypeFormInput) {
  const { data } = await api.post("/api/v1/document-types", cleanPayload(payload));
  return data;
}

export async function getDocumentTypes(
  params: GetDocumentTypesParams,
  signal?: AbortSignal,
): Promise<DocumentTypeListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<DocumentTypeListApiResponse>("/api/v1/document-types", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getDocumentTypeByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<DocumentTypeDetail> {
  const { data } = await api.get<DocumentTypeDetail>(`/api/v1/document-types/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateDocumentTypeByUuid(
  uuid: string,
  payload: DocumentTypeFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/document-types/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteDocumentTypeByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/document-types/${uuid}`);
  return data;
}

export async function restoreDocumentTypeByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/document-types/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteDocumentTypes(uuids: string[]): Promise<DocumentTypeBulkActionResult> {
  const { data } = await api.post<DocumentTypeBulkActionResult>("/api/v1/document-types/bulk-delete", {
    document_type_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreDocumentTypes(uuids: string[]): Promise<DocumentTypeBulkActionResult> {
  const { data } = await api.post<DocumentTypeBulkActionResult>("/api/v1/document-types/bulk-restore", {
    document_type_uuids: uuids,
  });
  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importDocumentTypesFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportResult>("/api/v1/document-types/import", formData);

  return data;
}
