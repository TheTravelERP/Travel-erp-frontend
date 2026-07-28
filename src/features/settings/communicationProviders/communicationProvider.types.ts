// src/features/settings/communicationProviders/communicationProvider.types.ts

export type ProviderCategory = "EMAIL" | "WHATSAPP" | "SMS";

export interface CommunicationProviderFormInput {
  provider_category: ProviderCategory;
  provider_type: string;
  provider_name: string;
  is_default?: boolean;
  is_active?: boolean;

  // Email
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  encryption_type?: string;

  // WhatsApp
  phone_number_id?: string;
  business_account_id?: string;
  access_token?: string;
  webhook_verify_token?: string;

  // SMS
  api_key?: string;
  secret_key?: string;
  sender_id?: string;
}

export interface CommunicationProviderDetail
  extends Omit<
    CommunicationProviderFormInput,
    "smtp_password" | "access_token" | "webhook_verify_token" | "api_key" | "secret_key"
  > {
  uuid: string;
  version_no: number;
  has_smtp_password: boolean;
  has_access_token: boolean;
  has_webhook_verify_token: boolean;
  has_api_key: boolean;
  has_secret_key: boolean;
}

export interface CommunicationProviderListItem {
  uuid: string;
  provider_category: ProviderCategory;
  provider_type: string;
  provider_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GetCommunicationProvidersParams {
  page?: number;
  page_size?: number;
  search?: string;
  provider_category?: ProviderCategory | "";
  provider_type?: string;
  from_date?: string;
  to_date?: string;
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

export interface CommunicationProviderListApiResponse {
  data: CommunicationProviderListItem[];
  pagination: Pagination;
}

export interface CommunicationProviderBulkActionResult {
  message: string;
  count: number;
}

export interface TestProviderResult {
  success: boolean;
  message: string;
}
