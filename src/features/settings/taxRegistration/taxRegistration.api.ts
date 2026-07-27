// src/features/settings/taxRegistration/taxRegistration.api.ts
import api from "../../../services/api";

import type {
  TaxRegistrationDetail,
  TaxRegistrationFormInput,
  TaxRegistrationListApiResponse,
  GetTaxRegistrationsParams,
  TaxRegistrationBulkActionResult,
} from "./taxRegistration.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createTaxRegistration(payload: TaxRegistrationFormInput) {
  const { data } = await api.post("/api/v1/tax-registrations", cleanPayload(payload));
  return data;
}

export async function getTaxRegistrations(
  params: GetTaxRegistrationsParams,
  signal?: AbortSignal,
): Promise<TaxRegistrationListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<TaxRegistrationListApiResponse>("/api/v1/tax-registrations", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getTaxRegistrationByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<TaxRegistrationDetail> {
  const { data } = await api.get<TaxRegistrationDetail>(`/api/v1/tax-registrations/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateTaxRegistrationByUuid(
  uuid: string,
  payload: TaxRegistrationFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/tax-registrations/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteTaxRegistrationByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/tax-registrations/${uuid}`);
  return data;
}

export async function restoreTaxRegistrationByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/tax-registrations/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteTaxRegistrations(uuids: string[]): Promise<TaxRegistrationBulkActionResult> {
  const { data } = await api.post<TaxRegistrationBulkActionResult>("/api/v1/tax-registrations/bulk-delete", {
    tax_registration_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreTaxRegistrations(uuids: string[]): Promise<TaxRegistrationBulkActionResult> {
  const { data } = await api.post<TaxRegistrationBulkActionResult>("/api/v1/tax-registrations/bulk-restore", {
    tax_registration_uuids: uuids,
  });
  return data;
}

/* ==========================================================
   IMPORT
========================================================== */

import type { ImportResult } from "../../../components/common/ImportResultDialog";

export async function importTaxRegistrationsFromCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ImportResult>("/api/v1/tax-registrations/import", formData);

  return data;
}
