// src/constant/enquiry.options.ts
import { ConversionStatus, EnquiryStatus } from "./enquiry.constants";

export const CONVERSION_STATUS_OPTIONS = [
  { label: 'Lost', value: ConversionStatus.LOST },
  { label: 'Pending', value: ConversionStatus.PENDING },
  { label: 'Converted', value: ConversionStatus.CONVERTED },
];


export const LEAD_SOURCE_OPTIONS = [
  { value: "WalkIn", label: "Walk-In" },
  { value: "Website", label: "Website" },
  { value: "Referral", label: "Referral" },
];

export const PRIORITY_OPTIONS = Object.values(EnquiryStatus).map(
  (value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })
);



