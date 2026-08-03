// src/features/settings/termsCondition/termsCondition.api.ts
import api from "../../../services/api";

import type {
  TermsConditionDetail,
  TermsConditionFormInput,
  TermsConditionListApiResponse,
  GetTermsConditionsParams,
  TermsConditionBulkActionResult,
} from "./termsCondition.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createTermsCondition(payload: TermsConditionFormInput) {
  const { data } = await api.post("/api/v1/terms-conditions", cleanPayload(payload));
  return data;
}

export async function getTermsConditions(
  params: GetTermsConditionsParams,
  signal?: AbortSignal,
): Promise<TermsConditionListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<TermsConditionListApiResponse>("/api/v1/terms-conditions", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getTermsConditionByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<TermsConditionDetail> {
  const { data } = await api.get<TermsConditionDetail>(`/api/v1/terms-conditions/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateTermsConditionByUuid(
  uuid: string,
  payload: TermsConditionFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/terms-conditions/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteTermsConditionByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/terms-conditions/${uuid}`);
  return data;
}

export async function restoreTermsConditionByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/terms-conditions/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteTermsConditions(uuids: string[]): Promise<TermsConditionBulkActionResult> {
  const { data } = await api.post<TermsConditionBulkActionResult>("/api/v1/terms-conditions/bulk-delete", {
    terms_condition_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreTermsConditions(uuids: string[]): Promise<TermsConditionBulkActionResult> {
  const { data } = await api.post<TermsConditionBulkActionResult>("/api/v1/terms-conditions/bulk-restore", {
    terms_condition_uuids: uuids,
  });
  return data;
}

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importTermsConditionsFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportResult>("/api/v1/terms-conditions/import", formData);
  return data;
}
