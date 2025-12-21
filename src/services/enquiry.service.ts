import api from './api';
import type { EnquiryFormInput } from '../pages/crm/enquiries/components/EnquiryForm';

export async function createEnquiry(payload: EnquiryFormInput) {
  const { data } = await api.post('/api/v1/crm/enquiries', payload);
  return data;
}
