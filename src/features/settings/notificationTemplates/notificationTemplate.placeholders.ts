// src/features/settings/notificationTemplates/notificationTemplate.placeholders.ts
//
// Mirrors app/services/notification/placeholders.py's PLACEHOLDER_SAMPLE_VALUES
// keys — keep the two lists in sync.

export interface PlaceholderDef {
  key: string;
  label: string;
}

export const TEMPLATE_PLACEHOLDERS: PlaceholderDef[] = [
  { key: "customer_name", label: "Customer Name" },
  { key: "agent_name", label: "Agent Name" },
  { key: "company_name", label: "Company Name" },
  { key: "booking_no", label: "Booking No" },
  { key: "quotation_no", label: "Quotation No" },
  { key: "invoice_no", label: "Invoice No" },
  { key: "followup_date", label: "Follow-up Date" },
  { key: "followup_time", label: "Follow-up Time" },
  { key: "visa_number", label: "Visa Number" },
  { key: "destination", label: "Destination" },
  { key: "amount", label: "Amount" },
  { key: "due_date", label: "Due Date" },
];
