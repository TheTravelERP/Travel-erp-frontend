// src/services/codeCheck.service.ts
// Generic "does this code already exist" check, shared by every master
// that has a Code field. See app/services/code_uniqueness_service.py for
// the backend counterpart — this is a thin client for the single shared
// GET /api/v1/common/code-check endpoint, config-driven per entity.
import api from "./api";

export interface CheckCodeParams {
  entity: string;
  code: string;
  extra_scope_value?: string;
  exclude_uuid?: string;
}

export async function checkCodeExists(
  params: CheckCodeParams,
  signal?: AbortSignal,
): Promise<boolean> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<{ exists: boolean }>("/api/v1/common/code-check", {
    params: cleanParams,
    signal,
  });

  return data.exists;
}
