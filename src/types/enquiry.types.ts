// src/types/enquiry.types.ts
import { ConversionStatus, EnquiryStatus } from "../constants/enquiry.constants";

export interface Enquiry {
  id: number;
  org_id: number;

  customer_name: string;
  customer_mobile: string;

  status: EnquiryStatus;
  conversion_status: ConversionStatus;

  pax_count: number;
  quote_amount: number;
  currency_code: string;

  agent_name: string;

  created_at: string;
}
