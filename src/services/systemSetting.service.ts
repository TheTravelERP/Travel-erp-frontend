// src/services/systemSetting.service.ts
import api from './api';

export interface SystemSettingsResponse {
  category: string;
  settings: Record<string, string | null>;
}

export const fetchSettings = async (
  category: string,
  signal?: AbortSignal
): Promise<SystemSettingsResponse> => {
  const res = await api.get(`/api/v1/settings/${category}`, { signal });
  return res.data;
};

export const updateSettings = async (
  category: string,
  settings: Record<string, string | null>
): Promise<SystemSettingsResponse> => {
  const res = await api.put(`/api/v1/settings/${category}`, { settings });
  return res.data;
};
