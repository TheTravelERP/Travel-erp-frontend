// statusChip.ts
import type { ChipProps } from '@mui/material';

export const STATUS_COLOR_MAP: Record<string, ChipProps['color']> = {
  Hot: 'error',
  Warm: 'warning',
  Cold: 'success',
  Converted: 'success',
  Pending: 'warning',
  Lost: 'secondary',
};
