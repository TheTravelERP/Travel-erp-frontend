// src/services/user.service.ts
//
// Lightweight lookup only — full Users CRUD lives in
// src/features/settings/users/ (users.api.ts). This stays around for
// consumers that just need a flat "pick a user" list, e.g. the
// Permissions page's user selector.
import api from './api';

export type UserType = 'Agent' | 'Employee' | 'Admin';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface UserListItem {
  id: number;
  name: string | null;
  email: string;
  mobile: string;
  user_type: UserType;
  status: UserStatus;
  last_login: string | null;
}

export const fetchUsersLookup = async (signal?: AbortSignal): Promise<UserListItem[]> => {
  const res = await api.get('/api/v1/settings/users/lookup', { signal });
  return res.data;
};
