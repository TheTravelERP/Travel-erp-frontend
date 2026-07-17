// src/services/organization.service.ts
import api from './api';

export interface OrganizationTheme {
  org_id: number;
  name: string;
  theme_color: string;
}

export const fetchMyOrganization = async (signal?: AbortSignal): Promise<OrganizationTheme> => {
  const res = await api.get('/api/v1/organization/me', { signal });
  return res.data;
};

export const updateThemeColor = async (themeColor: string): Promise<OrganizationTheme> => {
  const res = await api.put('/api/v1/organization/theme-color', { theme_color: themeColor });
  return res.data;
};
