// src/features/settings/users/users.types.ts

export type UserType = 'Agent' | 'Employee' | 'Admin';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

/* ==========================================================
   FORM
========================================================== */

export interface UserProfileFields {
  dob?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  anniversary_date?: string | null;
  blood_group?: string | null;
  designation?: string | null;
  date_of_joining?: string | null;
  picture_url?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;

  identification_type?: string | null;
  identification_number?: string | null;
  identification_file_url?: string | null;
}

export interface UserCreateInput extends UserProfileFields {
  name: string;
  email: string;
  mobile: string;
  user_type: UserType;
  password: string;
}

export interface UserUpdateInput extends UserProfileFields {
  name?: string;
  mobile?: string;
  user_type?: UserType;
  status?: UserStatus;
}

/* ==========================================================
   DETAIL / LIST ITEM
========================================================== */

export interface UserListItem extends UserProfileFields {
  id: number;
  uuid: string;
  name: string | null;
  email: string;
  mobile: string;
  user_type: UserType;
  status: UserStatus;
  age: number | null;
  last_login: string | null;
  created_at: string;
}

export interface UserDetail extends UserListItem {
  version_no: number;
}

/* ==========================================================
   LIST FILTERS / PAGINATION
========================================================== */

export interface GetUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  user_type?: string;
  status?: string;
  designation?: string;
  gender?: string;
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

export interface UserListApiResponse {
  data: UserListItem[];
  pagination: Pagination;
}

export interface UserBulkActionResult {
  message: string;
  count: number;
}
