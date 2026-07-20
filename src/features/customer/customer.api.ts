// src/features/customer/customer.api.ts
import api from "../../services/api";

import type {
  CustomerDetail,
  CustomerFormInput,
  CustomerListApiResponse,
  GetCustomersParams,
} from "./customer.types";

/* ==========================================================
   CREATE
========================================================== */

export async function createCustomer(payload: CustomerFormInput) {
  const { data } = await api.post("/api/v1/customers", payload, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   LIST
========================================================== */

export async function getCustomers(
  params: GetCustomersParams,
  signal?: AbortSignal,
): Promise<CustomerListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<CustomerListApiResponse>("/api/v1/customers", {
    params: cleanParams,
    signal,
  });

  return data;
}

/* ==========================================================
   VIEW
========================================================== */

export async function getCustomerByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<CustomerDetail> {
  const { data } = await api.get<CustomerDetail>(`/api/v1/customers/${uuid}`, {
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

export async function updateCustomerByUuid(
  uuid: string,
  payload: CustomerFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/customers/${uuid}`, payload, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   DELETE
========================================================== */

export async function deleteCustomerByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/customers/${uuid}`, {
    withCredentials: true,
  });

  return data;
}

/* ==========================================================
   RESTORE
========================================================== */

export async function restoreCustomerByUuid(uuid: string) {
  const { data } = await api.put(
    `/api/v1/customers/${uuid}/restore`,
    {},
    {
      withCredentials: true,
    },
  );

  return data;
}

/* ==========================================================
   BULK DELETE / RESTORE
========================================================== */

export interface CustomerBulkActionResult {
  message: string;
  count: number;
}

export async function bulkDeleteCustomers(
  uuids: string[],
): Promise<CustomerBulkActionResult> {
  const { data } = await api.post<CustomerBulkActionResult>(
    "/api/v1/customers/bulk-delete",
    { customer_uuids: uuids },
    { withCredentials: true },
  );

  return data;
}

export async function bulkRestoreCustomers(
  uuids: string[],
): Promise<CustomerBulkActionResult> {
  const { data } = await api.post<CustomerBulkActionResult>(
    "/api/v1/customers/bulk-restore",
    { customer_uuids: uuids },
    { withCredentials: true },
  );

  return data;
}
