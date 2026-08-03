// src/features/tasks/task.api.ts
import api from "../../services/api";
import type {
  TaskDetail,
  TaskFormInput,
  TaskListApiResponse,
  GetTasksParams,
  TaskBulkActionResult,
} from "./task.types";

export async function createTask(payload: TaskFormInput): Promise<TaskDetail> {
  const { data } = await api.post("/api/v1/tasks", payload);
  return data;
}

export async function getTasks(params: GetTasksParams, signal?: AbortSignal): Promise<TaskListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
  const { data } = await api.get<TaskListApiResponse>("/api/v1/tasks", { params: cleanParams, signal });
  return data;
}

export async function getTaskByUuid(uuid: string, isDeleted = false): Promise<TaskDetail> {
  const { data } = await api.get<TaskDetail>(`/api/v1/tasks/${uuid}`, { params: { is_deleted: isDeleted } });
  return data;
}

export async function updateTaskByUuid(uuid: string, payload: TaskFormInput & { version_no: number }): Promise<TaskDetail> {
  const { data } = await api.put(`/api/v1/tasks/${uuid}`, payload);
  return data;
}

export async function deleteTaskByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/tasks/${uuid}`);
  return data;
}

export async function restoreTaskByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/tasks/${uuid}/restore`);
  return data;
}

export async function bulkDeleteTasks(uuids: string[]): Promise<TaskBulkActionResult> {
  const { data } = await api.post<TaskBulkActionResult>("/api/v1/tasks/bulk-delete", { task_uuids: uuids });
  return data;
}

export async function bulkRestoreTasks(uuids: string[]): Promise<TaskBulkActionResult> {
  const { data } = await api.post<TaskBulkActionResult>("/api/v1/tasks/bulk-restore", { task_uuids: uuids });
  return data;
}
