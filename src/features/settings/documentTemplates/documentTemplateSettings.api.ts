// src/features/settings/documentTemplates/documentTemplateSettings.api.ts
import api from "../../../services/api";
import type {
  DocumentTemplateSettings,
  DocumentTemplateSettingsUpdate,
} from "./documentTemplateSettings.types";

export async function fetchDocumentTemplateSettings(signal?: AbortSignal): Promise<DocumentTemplateSettings> {
  const { data } = await api.get<DocumentTemplateSettings>("/api/v1/document-template-settings", { signal });
  return data;
}

export async function updateDocumentTemplateSettings(
  payload: DocumentTemplateSettingsUpdate,
): Promise<DocumentTemplateSettings> {
  const { data } = await api.put<DocumentTemplateSettings>("/api/v1/document-template-settings", payload);
  return data;
}

export async function previewDocumentTemplateSettings(
  overrides: Partial<DocumentTemplateSettings>,
): Promise<Blob> {
  const { data } = await api.post("/api/v1/document-template-settings/preview", overrides, {
    responseType: "blob",
  });
  return data;
}
