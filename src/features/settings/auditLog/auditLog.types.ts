// src/features/settings/auditLog/auditLog.types.ts

export interface AuditLogListItem {
  uuid: string;
  entity_type: string;
  entity_id?: number;
  entity_uuid?: string;
  action: string;
  actor_user_id?: number;
  actor_name?: string;
  actor_email?: string;
  ip_address?: string;
  user_agent?: string;
  changed_columns?: string[];
  created_at: string;
}

export interface AuditLogDetail extends AuditLogListItem {
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
}

export interface GetAuditLogsParams {
  page?: number;
  page_size?: number;
  entity_type?: string;
  action?: string;
  actor_user_id?: number;
  from_date?: string;
  to_date?: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface AuditLogListApiResponse {
  data: AuditLogListItem[];
  pagination: Pagination;
}

// Closed set of actions the backend ever writes — see app/services/audit_log_service.py
// and every *_service.py's record_audit_log(action=...) call sites.
export const AUDIT_LOG_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "BULK_DELETE",
  "BULK_RESTORE",
  "IMPORT",
  "EXPORT",
] as const;
