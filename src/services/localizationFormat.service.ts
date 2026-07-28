// src/services/localizationFormat.service.ts
import api from './api';

export interface EffectiveFormatSettings {
  date_format: string;
  time_format: string;
  number_format: string;
  default_decimal_places: number;
  round_off_method: string;
  timezone: string;
}

export const fetchEffectiveFormatSettings = async (signal?: AbortSignal): Promise<EffectiveFormatSettings> => {
  const res = await api.get('/api/v1/localization-profiles/effective', { signal });
  return res.data;
};
