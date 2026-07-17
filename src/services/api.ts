// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  withCredentials: true, // ✅ VERY IMPORTANT for HttpOnly cookies
});

api.interceptors.request.use((config) => {
  return config;
}, (err) => {
  console.error("AXIOS REQ ERROR:", err);
  return Promise.reject(err);
});

api.interceptors.response.use((resp) => {
  return resp;
}, (err) => {
  // Cancelled requests (e.g. effect cleanup on unmount) and 401s from
  // expected "am I logged in?" checks aren't real failures — don't log them.
  const isCancelled = axios.isCancel(err);
  const isUnauthorized = err?.response?.status === 401;

  if (!isCancelled && !isUnauthorized) {
    console.error("AXIOS RESP ERROR:", err);
  }

  return Promise.reject(err);
});

export default api;
