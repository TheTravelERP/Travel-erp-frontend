// src/pages/crm/enquiries/enquiry.types.ts
export interface EnquiryListColumn {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  format?: 'date' | 'currency' | 'chip';
}
