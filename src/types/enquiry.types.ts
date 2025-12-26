// src/types/enquiry.types.ts
import { ConversionStatus, EnquiryStatus } from "../constants/enquiry.constants";

export interface Enquiry {
  id: number;
  org_id: number;

  customer_name: string;
  customer_mobile: string;
  customer_email?: string | null;

  status: EnquiryStatus;
  conversion_status: ConversionStatus;

  pax_count: number;
  quote_amount: number;
  currency_code: string;

  agent_name: string;

  created_at: string;
}


export interface EnquiryListItem {
  id: number;

  customer_name: string;
  customer_mobile: string;

  package_name: string;

  pax_count: number;
  priority: string;
  conversion_status: ConversionStatus;

  agent_name: string;
  created_at: string;
}


export interface EnquiryListResponse {
  data: EnquiryListItem[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

