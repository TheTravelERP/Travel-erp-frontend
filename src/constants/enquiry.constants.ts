//src/constants/enquiry.constatnts.ts
export const ConversionStatus = {
  LOST: 'Lost',
  PENDING: 'Pending',
  CONVERTED: 'Converted',
} as const;

export type ConversionStatus =
  (typeof ConversionStatus)[keyof typeof ConversionStatus];


export const EnquiryStatus = {
    HOT: "Hot",
    WARM: "Warm",
    COLD: "Cold",
} as const;

export type EnquiryStatus = 
    (typeof EnquiryStatus)[keyof typeof EnquiryStatus];
