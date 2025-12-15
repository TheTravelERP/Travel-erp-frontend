import api from './api';

export const fetchUserMenu = async () => {
  const res = await api.get('/api/v1/me/navigation', {
    withCredentials: true,
  });
  return res.data;
};
