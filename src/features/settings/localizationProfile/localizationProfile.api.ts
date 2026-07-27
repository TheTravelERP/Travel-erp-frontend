// src/features/settings/localizationProfile/localizationProfile.api.ts
import api from "../../../services/api";

import type {
  LocalizationProfileDetail,
  LocalizationProfileFormInput,
  LocalizationProfileListApiResponse,
  GetLocalizationProfilesParams,
  LocalizationProfileBulkActionResult,
} from "./localizationProfile.types";

export async function createLocalizationProfile(payload: LocalizationProfileFormInput) {
  const { data } = await api.post("/api/v1/localization-profiles", payload);
  return data;
}

export async function getLocalizationProfiles(
  params: GetLocalizationProfilesParams,
  signal?: AbortSignal,
): Promise<LocalizationProfileListApiResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );

  const { data } = await api.get<LocalizationProfileListApiResponse>("/api/v1/localization-profiles", {
    params: cleanParams,
    signal,
  });

  return data;
}

export async function getLocalizationProfileByUuid(
  uuid: string,
  isDeleted: boolean = false,
): Promise<LocalizationProfileDetail> {
  const { data } = await api.get<LocalizationProfileDetail>(`/api/v1/localization-profiles/${uuid}`, {
    params: { is_deleted: isDeleted },
  });
  return data;
}

export async function updateLocalizationProfileByUuid(
  uuid: string,
  payload: LocalizationProfileFormInput & { version_no: number },
) {
  const { data } = await api.put(`/api/v1/localization-profiles/${uuid}`, payload);
  return data;
}

export async function deleteLocalizationProfileByUuid(uuid: string) {
  const { data } = await api.delete(`/api/v1/localization-profiles/${uuid}`);
  return data;
}

export async function restoreLocalizationProfileByUuid(uuid: string) {
  const { data } = await api.put(`/api/v1/localization-profiles/${uuid}/restore`, {});
  return data;
}

export async function bulkDeleteLocalizationProfiles(uuids: string[]): Promise<LocalizationProfileBulkActionResult> {
  const { data } = await api.post<LocalizationProfileBulkActionResult>("/api/v1/localization-profiles/bulk-delete", {
    localization_profile_uuids: uuids,
  });
  return data;
}

export async function bulkRestoreLocalizationProfiles(uuids: string[]): Promise<LocalizationProfileBulkActionResult> {
  const { data } = await api.post<LocalizationProfileBulkActionResult>("/api/v1/localization-profiles/bulk-restore", {
    localization_profile_uuids: uuids,
  });
  return data;
}
