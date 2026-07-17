// src/services/menu.service.ts
import api from './api';

export const fetchUserMenu = async (signal?: AbortSignal) => {
  const res = await api.get('/api/v1/me/navigation', { signal });
  return res.data;
};
