// src/features/enquiry/enquiry.api.ts
import api from "../../services/api";

import type {
  EnquiryDetail,
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
  signal?: AbortSignal,
): Promise<EnquiryListApiResponse> {
  // Strip empty-string filters (e.g. unset date fields) so they aren't sent
  // as query params — FastAPI's Optional[date] rejects "" outright.
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<EnquiryListApiResponse>("/api/v1/enquiries", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   VIEW
========================================================== */

export async function getEnquiryByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<EnquiryDetail> {
  const { data } = await api.get<EnquiryDetail>(`/api/v1/enquiries/${uuid}`, {
    params: {
      is_deleted: isDeleted,
    },
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   UPDATE
========================================================== */

export async function updateEnquiryByUuid(
  uuid: string,
  payload: EnquiryFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/enquiries/${uuid}`, payload, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   DELETE
========================================================== */

export async function deleteEnquiryByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/enquiries/${uuid}`, {
    withCredentials: true,
  });

  return data;
}


/* ==========================================================
   RESTORE
========================================================== */

export async function restoreEnquiryByUuid(uuid: string) {
  const { data } = await api.put(
    `/api/v1/enquiries/${uuid}/restore`,
    {},
    {
      withCredentials: true,
    }
  );

  return data;
}

/* ==========================================================
   BULK DELETE / RESTORE
========================================================== */

export interface EnquiryBulkActionResult {
  message: string;
  count: number;
}

export async function bulkDeleteEnquiries(
  uuids: string[],
): Promise<EnquiryBulkActionResult> {
  const { data } = await api.post<EnquiryBulkActionResult>(
    "/api/v1/enquiries/bulk-delete",
    { enquiry_uuids: uuids },
    { withCredentials: true },
  );

  return data;
}

export async function bulkRestoreEnquiries(
  uuids: string[],
): Promise<EnquiryBulkActionResult> {
  const { data } = await api.post<EnquiryBulkActionResult>(
    "/api/v1/enquiries/bulk-restore",
    { enquiry_uuids: uuids },
    { withCredentials: true },
  );

  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

export interface EnquiryImportResult {
  total_rows: number;
  imported: number;
  failed: number;
  errors: { row: number | null; error: string }[];
}

export async function importEnquiriesFromCsv(
  file: File,
): Promise<EnquiryImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<EnquiryImportResult>(
    "/api/v1/enquiries/import",
    formData,
    { withCredentials: true },
  );

  return data;
}
