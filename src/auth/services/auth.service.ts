// src/auth/services/auth.service.ts
import api from "../../services/api";
import type { RegisterOrgInput } from "../../utils/validator";


export async function loginApi(payload: { email: string; password: string }) {
  try {
     const { data } = await api.post('/api/v1/auth/login', payload, {
      withCredentials: true, // IMPORTANT
    });
    return data;
  } catch (err: any) {
    console.error("loginApi error:", err?.response?.data ?? err);
    throw err;
  }
}



export async function registerOrgApi(payload: RegisterOrgInput) {
  // Build backend payload shape expected by your FastAPI:
  const body = {
    organization: {
      name: payload.organization_name,
      country_code: payload.country_code,
      max_users: 50,
      max_bookings: 1000,
    },
    admin: {
      admin_name: payload.admin_name,
      email: payload.email,
      mobile: payload.mobile ?? "",
      password: payload.password.length > 72 ? payload.password.slice(0, 72) : payload.password,
    },
  };

  const { data } = await api.post("/api/v1/auth/register", body);
  return data;
}
