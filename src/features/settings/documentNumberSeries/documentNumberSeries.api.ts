// src/features/settings/documentNumberSeries/documentNumberSeries.api.ts
import api from "../../../services/api";

import type {
  DocumentNumberSeriesDetail,
  DocumentNumberSeriesFormInput,
  DocumentNumberSeriesListApiResponse,
  GetDocumentNumberSeriesParams,
  CloneDocumentNumberSeriesInput,
} from "./documentNumberSeries.types";

function cleanPayload<T extends object>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export async function createDocumentNumberSeries(payload: DocumentNumberSeriesFormInput) {
  const { data } = await api.post("/api/v1/document-number-series", cleanPayload(payload));
  return data;
}

export async function getDocumentNumberSeriesList(
  params: GetDocumentNumberSeriesParams,
  signal?: AbortSignal,
): Promise<DocumentNumberSeriesListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<DocumentNumberSeriesListApiResponse>("/api/v1/document-number-series", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getDocumentNumberSeriesByUuid(uuid: string): Promise<DocumentNumberSeriesDetail> {
  const { data } = await api.get<DocumentNumberSeriesDetail>(`/api/v1/document-number-series/${uuid}`);
  return data;
}

export async function updateDocumentNumberSeriesByUuid(
  uuid: string,
  payload: DocumentNumberSeriesFormInput,
) {
  const { data } = await api.put(`/api/v1/document-number-series/${uuid}`, cleanPayload(payload));
  return data;
}

export async function deleteDocumentNumberSeriesByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/document-number-series/${uuid}`);
  return data;
}

export async function cloneDocumentNumberSeriesByUuid(
  uuid: string,
  payload: CloneDocumentNumberSeriesInput,
) {
  const { data } = await api.post(`/api/v1/document-number-series/${uuid}/clone`, cleanPayload(payload));
  return data;
}
