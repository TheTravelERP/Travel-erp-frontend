// src/pages/crm/enquiries/components/ConversionStatusChip.ts
import type { ChipProps } from '@mui/material';
import { ConversionStatus } from '../../../../constants/enquiry.constants';

export const CONVERSION_STATUS_COLOR_MAP: Record<
  ConversionStatus,
  ChipProps['color']
> = {
  [ConversionStatus.LOST]: 'error',
  [ConversionStatus.PENDING]: 'warning',
  [ConversionStatus.CONVERTED]: 'success',
};
