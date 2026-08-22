// src/features/reports/travelers/travelerReport.api.ts
import api from "../../../services/api";
import type { TravelerReportApiResponse, TravelerReportParams } from "./travelerReport.types";

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}

export async function getTravelerReport(
  params: TravelerReportParams,
  signal?: AbortSignal,
): Promise<TravelerReportApiResponse> {
  const { data } = await api.get<TravelerReportApiResponse>("/api/v1/reports/travelers", {
    params: cleanParams(params),
    signal,
  });
  return data;
}
