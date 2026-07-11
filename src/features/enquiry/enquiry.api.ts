// src/features/enquiry/enquiry.api.ts
import api from "../../services/api";

import type {
  EnquiryFormInput,
  EnquiryListApiResponse,
  GetEnquiriesParams,
} from "./enquiry.types";

/* ==========================================================
   CREATE
========================================================== */

export async function createEnquiry(payload: EnquiryFormInput) {
  const { data } = await api.post("/api/v1/enquiries", payload, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getEnquiries(
  params: GetEnquiriesParams,
): Promise<EnquiryListApiResponse> {
  const { data } = await api.get<EnquiryListApiResponse>("/api/v1/enquiries", {
    params,
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   VIEW
========================================================== */

export async function getEnquiryById(id: number) {
  const { data } = await api.get(`/api/v1/enquiries/${id}`, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updateEnquiryById(id: number, payload: EnquiryFormInput) {
  const { data } = await api.put(`/api/v1/enquiries/${id}`, payload, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   DELETE
========================================================== */

export async function deleteEnquiryById(id: number) {
  const { data } = await api.delete(`/api/v1/enquiries/${id}`, {
    withCredentials: true,
  });

  return data;
}
