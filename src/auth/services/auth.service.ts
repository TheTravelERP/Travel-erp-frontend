// src/auth/services/auth.service.ts
import api from "../../services/api";
import type { RegisterOrgInput } from "../../utils/validator";


// Registration APIs
export async function requestRegistrationOtp(
  payload: RegisterOrgInput
) {
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
      mobile: payload.mobile,
      password: payload.password,
    },
  };

  const { data } = await api.post(
    "/api/v1/auth/register/request-otp",
    body
  );

  return data;
}

export async function verifyOtpApi(
  payload: {
    email: string;
    otp: string;
  }
) {
  const { data } = await api.post(
    "/api/v1/auth/register/verify-otp",
    payload
  );

  return data;
}

export async function resendOtpApi(
  email: string
) {
  const { data } = await api.post(
    "/api/v1/auth/register/resend-otp",
    {
      email,
    }
  );

  return data;
}

// Login API
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


// Forgot Password APIs
export async function forgotPasswordRequestOtpApi(
  email: string
) {
  const { data } = await api.post(
    "/api/v1/auth/forgot-password/request-otp",
    {
      email,
    }
  );

  return data;
}

export async function forgotPasswordVerifyOtpApi(
  payload: {
    email: string;
    otp: string;
  }
) {
  const { data } = await api.post(
    "/api/v1/auth/forgot-password/verify-otp",
    payload
  );

  return data;
}

export async function resetPasswordApi(
  payload: {
    email: string;
    otp: string;
    password: string;
  }
) {
  const { data } = await api.post(
    "/api/v1/auth/forgot-password/reset",
    payload
  );

  return data;
}

export async function changePasswordApi(
  payload: {
    old_password: string;
    new_password: string;
  }
) {
  const { data } = await api.post(
    "/api/v1/auth/change-password",
    payload
  );

  return data;
}




