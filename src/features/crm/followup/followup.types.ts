// src/features/crm/followup/followup.types.ts

export interface FollowupFormInput {
  enquiry_uuid: string;
  quotation_uuid?: string;
  assigned_user_uuid: string;
  followup_type: string;
  followup_datetime: string;
  next_followup_datetime?: string;
  discussion_notes: string;
  outcome?: string;
  status?: string;
  priority: string;
}

export interface FollowupDetail extends FollowupFormInput {
  uuid: string;
  enquiry_no?: string;
  customer_name?: string;
  customer_mobile?: string;
  assigned_user_name?: string;
  is_active: boolean;
  version_no: number;
}

export interface FollowupListItem {
  uuid: string;
  enquiry_uuid?: string;
  enquiry_no?: string;
  customer_name?: string;
  customer_mobile?: string;
  assigned_user_uuid?: string;
  assigned_user_name?: string;
  followup_type: string;
  followup_datetime: string;
  next_followup_datetime?: string;
  discussion_notes: string;
  outcome?: string;
  status: string;
  priority: string;
  is_active: boolean;
  created_at: string;
}

export interface GetFollowupsParams {
  page?: number;
  page_size?: number;
  search?: string;
  enquiry_uuid?: string;
  assigned_user_uuid?: string;
  followup_type?: string;
  status?: string;
  priority?: string;
  next_from_date?: string;
  next_to_date?: string;
  overdue?: boolean;
  is_deleted?: boolean;

  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface FollowupListApiResponse {
  data: FollowupListItem[];
  pagination: Pagination;
}

export interface FollowupBulkActionResult {
  message: string;
  count: number;
}

// ---------- Reminder Workspace quick actions ----------

export type ReminderBucket = "overdue" | "today" | "tomorrow" | "upcoming" | "completed";

export interface FollowupHistoryItem {
  uuid: string;
  entity_type: string;
  entity_id: number;
  entity_uuid: string;
  action: string;
  actor_user_id?: number;
  actor_name?: string;
  actor_email?: string;
  changed_columns?: string[];
  created_at: string;
}

export interface FollowupHistoryResponse {
  data: FollowupHistoryItem[];
  pagination: Pagination;
}
