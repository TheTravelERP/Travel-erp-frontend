// src/features/crm/quotation/quotation.api.ts
import api from "../../../services/api";
import type {
  QuotationDetail,
  QuotationFormInput,
  QuotationListApiResponse,
  QuotationVersionSummary,
  GetQuotationsParams,
  QuotationBulkActionResult,
} from "./quotation.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createQuotation(payload: QuotationFormInput) {
  const { data } = await api.post("/api/v1/quotations", cleanPayload(payload));
  return data;
}

export async function getQuotationsList(
  params: GetQuotationsParams,
  signal?: AbortSignal,
): Promise<QuotationListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
  const { data } = await api.get<QuotationListApiResponse>("/api/v1/quotations", { params: cleanParams, signal });
  return data;
}

export async function getQuotationByUuid(uuid: string): Promise<QuotationDetail> {
  const { data } = await api.get<QuotationDetail>(`/api/v1/quotations/${uuid}`);
  return data;
}

export async function updateQuotationByUuid(uuid: string, payload: QuotationFormInput & { version_no: number }) {
  const { data } = await api.put(`/api/v1/quotations/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteQuotationByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/quotations/${uuid}`);
  return data;
}

export async function restoreQuotationByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/quotations/${uuid}/restore`);
  return data;
}

export async function bulkDeleteQuotations(quotation_uuids: string[]): Promise<QuotationBulkActionResult> {
  const { data } = await api.post("/api/v1/quotations/bulk-delete", { quotation_uuids });
  return data;
}

export async function bulkRestoreQuotations(quotation_uuids: string[]): Promise<QuotationBulkActionResult> {
  const { data } = await api.post("/api/v1/quotations/bulk-restore", { quotation_uuids });
  return data;
}

export async function getQuotationVersions(uuid: string): Promise<QuotationVersionSummary[]> {
  const { data } = await api.get<{ data: QuotationVersionSummary[] }>(`/api/v1/quotations/${uuid}/versions`);
  return data.data;
}

export async function reviseQuotation(uuid: string): Promise<QuotationDetail> {
  const { data } = await api.post(`/api/v1/quotations/${uuid}/revise`);
  return data;
}

export async function acceptQuotation(uuid: string): Promise<QuotationDetail> {
  const { data } = await api.post(`/api/v1/quotations/${uuid}/accept`);
  return data;
}

export async function rejectQuotation(uuid: string, lost_reason?: string): Promise<QuotationDetail> {
  const { data } = await api.post(`/api/v1/quotations/${uuid}/reject`, { lost_reason });
  return data;
}

export async function convertQuotationToBooking(uuid: string) {
  const { data } = await api.post(`/api/v1/quotations/${uuid}/convert-to-booking`);
  return data;
}

export async function previewQuotationPdf(uuid: string): Promise<Blob> {
  const { data } = await api.post(`/api/v1/quotations/${uuid}/preview`, null, { responseType: "blob" });
  return data;
}

export function quotationPdfDownloadUrl(uuid: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  return `${base}/api/v1/quotations/${uuid}/pdf`;
}
