// src/features/crm/followup/followup.api.ts
import api from "../../../services/api";

import type {
  FollowupDetail,
  FollowupFormInput,
  FollowupListApiResponse,
  GetFollowupsParams,
  FollowupBulkActionResult,
  FollowupHistoryResponse,
} from "./followup.types";
import type { ImportResult } from "../../../components/common/ImportResultDialog";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createFollowup(payload: FollowupFormInput) {
  const { data } = await api.post("/api/v1/enquiry-followups", cleanPayload(payload));
  return data;
}

export async function getFollowups(
  params: GetFollowupsParams,
  signal?: AbortSignal,
): Promise<FollowupListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<FollowupListApiResponse>("/api/v1/enquiry-followups", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getFollowupByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<FollowupDetail> {
  const { data } = await api.get<FollowupDetail>(`/api/v1/enquiry-followups/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateFollowupByUuid(
  uuid: string,
  payload: FollowupFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/enquiry-followups/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteFollowupByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/enquiry-followups/${uuid}`);
  return data;
}

export async function restoreFollowupByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/enquiry-followups/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteFollowups(uuids: string[]): Promise<FollowupBulkActionResult> {
  const { data } = await api.post<FollowupBulkActionResult>("/api/v1/enquiry-followups/bulk-delete", {
    enquiry_followup_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreFollowups(uuids: string[]): Promise<FollowupBulkActionResult> {
  const { data } = await api.post<FollowupBulkActionResult>("/api/v1/enquiry-followups/bulk-restore", {
    enquiry_followup_uuids: uuids,
  });
  return data;
}

export async function importFollowupsFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ImportResult>("/api/v1/enquiry-followups/import", formData);
  return data;
}

// ---------- Reminder Workspace quick actions ----------

export async function completeFollowup(uuid: string, outcome?: string): Promise<FollowupDetail> {
  const { data } = await api.post(`/api/v1/enquiry-followups/${uuid}/complete`, { outcome });
  return data;
}

export async function rescheduleFollowup(uuid: string, nextFollowupDatetime: string): Promise<FollowupDetail> {
  const { data } = await api.post(`/api/v1/enquiry-followups/${uuid}/reschedule`, {
    next_followup_datetime: nextFollowupDatetime,
  });
  return data;
}

export async function snoozeFollowup(uuid: string, nextFollowupDatetime: string): Promise<FollowupDetail> {
  const { data } = await api.post(`/api/v1/enquiry-followups/${uuid}/snooze`, {
    next_followup_datetime: nextFollowupDatetime,
  });
  return data;
}

export async function assignFollowup(uuid: string, assignedUserUuid: string): Promise<FollowupDetail> {
  const { data } = await api.post(`/api/v1/enquiry-followups/${uuid}/assign`, {
    assigned_user_uuid: assignedUserUuid,
  });
  return data;
}

export async function cancelFollowup(uuid: string): Promise<FollowupDetail> {
  const { data } = await api.post(`/api/v1/enquiry-followups/${uuid}/cancel`, {});
  return data;
}

export async function getFollowupHistory(uuid: string, page = 1, pageSize = 20): Promise<FollowupHistoryResponse> {
  const { data } = await api.get<FollowupHistoryResponse>(`/api/v1/enquiry-followups/${uuid}/history`, {
    params: { page, page_size: pageSize },
  });
  return data;
}
