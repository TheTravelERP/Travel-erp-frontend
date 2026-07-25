// src/features/settings/branch/branch.api.ts
import api from "../../../services/api";

import type {
  BranchDetail,
  BranchFormInput,
  BranchListApiResponse,
  GetBranchesParams,
  BranchBulkActionResult,
} from "./branch.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createBranch(payload: BranchFormInput) {
  const { data } = await api.post("/api/v1/branches", cleanPayload(payload));
  return data;
}

export async function getBranches(
  params: GetBranchesParams,
  signal?: AbortSignal,
): Promise<BranchListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<BranchListApiResponse>("/api/v1/branches", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getBranchByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<BranchDetail> {
  const { data } = await api.get<BranchDetail>(`/api/v1/branches/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateBranchByUuid(
  uuid: string,
  payload: BranchFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/branches/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteBranchByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/branches/${uuid}`);
  return data;
}

export async function restoreBranchByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/branches/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteBranches(uuids: string[]): Promise<BranchBulkActionResult> {
  const { data } = await api.post<BranchBulkActionResult>("/api/v1/branches/bulk-delete", {
    branch_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreBranches(uuids: string[]): Promise<BranchBulkActionResult> {
  const { data } = await api.post<BranchBulkActionResult>("/api/v1/branches/bulk-restore", {
    branch_uuids: uuids,
  });
  return data;
}

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importBranchesFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportResult>("/api/v1/branches/import", formData);
  return data;
}
