// src/services/dropdown.services.ts
import api from './api';

export interface DropdownOption {
  label: string;
  value: string;
  color_code?: string | null;
  icon?: string | null;
}

/* ---------------- GET OPTIONS ---------------- */

export interface GetDropdownParams {
  dropdown_name: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const getDropdownOptions = async (
  params: GetDropdownParams,
  signal?: AbortSignal
): Promise<DropdownOption[]> => {
  const { data } = await api.get('/api/v1/common/dropdowns', {
    params,
    signal,
  });

  return data;
};

/* ---------------- CREATE OPTION ---------------- */

export const createDropdownOption = async (
  dropdown_name: string,
  label: string,
  value: string
): Promise<DropdownOption> => {
  const { data } = await api.post('/api/v1/common/dropdowns', null, {
    params: { dropdown_name, label, value },
    withCredentials: true,
  });

  return data;
};

export const getEntityDropdownOptions = async (
  params: {
    dropdown_name: string;
    search?: string;
    page?: number;
    page_size?: number;
    document_type_code?: string;
  },
  signal?: AbortSignal
) => {
  const { data } = await api.get('/api/v1/common/dropdowns/entity', {
    params,
    signal,
  });

  return data;
};

/**
 * Exact-match lookup by value_column — resolves a pre-filled edit-form
 * value (often a uuid) that the fuzzy `search` param above can't find,
 * since search only matches label-oriented search_columns.
 */
export const getEntityDropdownOptionByValue = async (
  params: { dropdown_name: string; value: string },
  signal?: AbortSignal
): Promise<DropdownOption | null> => {
  const { data } = await api.get('/api/v1/common/dropdowns/entity/by-value', {
    params,
    signal,
  });

  return data.item ?? null;
};