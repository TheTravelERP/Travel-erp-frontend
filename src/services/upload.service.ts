// src/services/upload.service.ts
import api from './api';

export type UploadEntity = 'organization' | 'customer' | 'user' | 'package_detail';

export async function uploadFile(
  file: File,
  entity: UploadEntity,
  category: string,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<{ url: string }>(
    `/api/v1/uploads?entity=${entity}&category=${category}`,
    formData,
  );

  return data;
}

/** Uploaded file URLs are backend-relative paths (e.g. "/uploads/ORG1/customer/picture/x.jpg") — resolve against the API origin, not the frontend's. */
export function resolveUploadUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${base}${path}`;
}

export type FileKind = 'image' | 'pdf' | 'other';

/** Backend only ever stores images or PDFs (see UPLOAD_RULES), detected here from the URL's extension. */
export function getFileKind(url: string): FileKind {
  const clean = url.split('?')[0].toLowerCase();
  if (/\.(jpe?g|png|webp|gif|bmp|svg)$/.test(clean)) return 'image';
  if (/\.pdf$/.test(clean)) return 'pdf';
  return 'other';
}
