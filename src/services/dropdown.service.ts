// src/services/dropdown.services.ts
import api from './api';

export interface DropdownOption {
  label: string;
  value: string;
}

/* ---------------- GET OPTIONS ---------------- */

export interface GetDropdownParams {
  dropdown_name: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const getDropdownOptions = async (
  params: GetDropdownParams
): Promise<DropdownOption[]> => {
  const { data } = await api.get('/api/v1/common/dropdowns', {
    params,
    withCredentials: true,
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