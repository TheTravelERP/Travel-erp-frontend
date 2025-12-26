// src/services/enquiry.services.ts


import api from './api';
import type { EnquiryFormInput } from '../pages/crm/enquiries/components/EnquiryForm';

import type { EnquiryListItem } from "../types/enquiry.types";
import type { GetEnquiriesParams } from "./enquiry.service";


export async function createEnquiry(payload: EnquiryFormInput) {
  const { data } = await api.post('/api/v1/crm/enquiries', payload);
  return data;
}

export interface GetEnquiriesParams {
  page?: number;
  page_size?: number;
  search?: string;
  conversion_status?: string;
  agent_name?: string;
  from_date?: string;
  to_date?: string;
  lead_source?: string;
}

export interface EnquiryListApiResponse {
  data: EnquiryListItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}


export const getEnquiries = async (
  params: GetEnquiriesParams
): Promise<EnquiryListApiResponse> => {
  const { data } = await api.get<EnquiryListApiResponse>(
    '/api/v1/crm/enquiries',
    {
      params,
      withCredentials: true,
    }
  );

  return data;
};

