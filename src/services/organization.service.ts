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

export interface OrganizationProfile {
  org_id: number;
  name: string;
  legal_name: string | null;
  logo_url: string | null;
  header_image_url: string | null;
  footer_image_url: string | null;
  doc1_label: string | null;
  doc1_url: string | null;
  doc2_label: string | null;
  doc2_url: string | null;
  doc3_label: string | null;
  doc3_url: string | null;
  doc4_label: string | null;
  doc4_url: string | null;
  website: string | null;
  email: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country_code: string;

  // Editable FKs (Localization redesign) — the org picks these instead of
  // entering the flattened fields below directly.
  localization_profile_uuid: string | null;
  tax_registration_uuid: string | null;

  // Response-only from here down — server-computed from the linked
  // LocalizationProfile/TaxRegistration. Shape kept stable on purpose:
  // useFinancialYearStartMonth() (src/hooks/useOrganizationSettings.ts) is
  // consumed by ~18 files via QuickDateRangeFilter, so financial_year_start_month
  // (and these siblings) must keep flowing through this exact contract.
  tax_registration_label: string | null;
  tax_registration_number: string | null;
  timezone: string;
  date_format: string;
  time_format: string;
  financial_year_start_month: number;
  base_currency: string;
}

// Only the fields the backend's OrganizationProfileUpdate schema actually
// accepts — the flattened locale/tax fields above are response-only now.
export type OrganizationProfileUpdate = Partial<
  Pick<
    OrganizationProfile,
    | 'name'
    | 'legal_name'
    | 'logo_url'
    | 'header_image_url'
    | 'footer_image_url'
    | 'doc1_label'
    | 'doc1_url'
    | 'doc2_label'
    | 'doc2_url'
    | 'doc3_label'
    | 'doc3_url'
    | 'doc4_label'
    | 'doc4_url'
    | 'website'
    | 'email'
    | 'mobile'
    | 'address'
    | 'city'
    | 'state'
    | 'localization_profile_uuid'
    | 'tax_registration_uuid'
  >
>;

export const fetchOrganizationSettings = async (signal?: AbortSignal): Promise<OrganizationProfile> => {
  const res = await api.get('/api/v1/organization/settings', { signal });
  return res.data;
};

export const updateOrganizationSettings = async (
  payload: OrganizationProfileUpdate
): Promise<OrganizationProfile> => {
  const res = await api.put('/api/v1/organization/settings', payload);
  return res.data;
};
