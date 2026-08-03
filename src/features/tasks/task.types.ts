// src/features/tasks/task.types.ts

export interface TaskFormInput {
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  priority: string;
  assigned_to_uuid: string;
  linked_entity_type?: string | null;
  linked_entity_uuid?: string | null;
}

export interface TaskDetail extends TaskFormInput {
  uuid: string;
  completed_at?: string | null;
  assigned_to_name?: string | null;
  linked_entity_label?: string | null;
  version_no: number;
  created_at: string;
}

export interface TaskListItem {
  uuid: string;
  title: string;
  due_date?: string | null;
  status: string;
  priority: string;
  assigned_to_uuid?: string | null;
  assigned_to_name?: string | null;
  linked_entity_type?: string | null;
  linked_entity_uuid?: string | null;
  linked_entity_label?: string | null;
  created_at: string;
}

export interface GetTasksParams {
  menu_key?: "tasks.my" | "tasks.team";
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  priority?: string;
  assigned_to_uuid?: string;
  linked_entity_type?: string;
  linked_entity_uuid?: string;
  from_date?: string;
  to_date?: string;
  is_deleted?: boolean;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface TaskListApiResponse {
  data: TaskListItem[];
  pagination: Pagination;
}

export interface TaskBulkActionResult {
  message: string;
  count: number;
}
