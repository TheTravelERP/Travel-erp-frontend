import { ConversionStatus } from "./enquiry.constants";

export const CONVERSION_STATUS_OPTIONS = [
  { label: 'Lost', value: ConversionStatus.LOST },
  { label: 'Pending', value: ConversionStatus.PENDING },
  { label: 'Converted', value: ConversionStatus.CONVERTED },
];
