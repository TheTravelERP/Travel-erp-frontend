// src/features/settings/auditLog/auditLog.api.ts
import api from "../../../services/api";

import type {
  AuditLogDetail,
  AuditLogListApiResponse,
  GetAuditLogsParams,
} from "./auditLog.types";

export async function getAuditLogs(
  params: GetAuditLogsParams,
  signal?: AbortSignal,
): Promise<AuditLogListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<AuditLogListApiResponse>("/api/v1/audit-log", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getAuditLogEntityTypes(signal?: AbortSignal): Promise<string[]> {
  const { data } = await api.get<string[]>("/api/v1/audit-log/entity-types", { signal });
  return data;
}

export async function getAuditLogDetail(uuid: string): Promise<AuditLogDetail> {
  const { data } = await api.get<AuditLogDetail>(`/api/v1/audit-log/${uuid}`);
  return data;
}
