// src/theme/palette.ts
import type { PaletteOptions } from '@mui/material/styles';

export const DEFAULT_PRIMARY_COLOR = '#30a435';

const getPalette = (primaryColor: string = DEFAULT_PRIMARY_COLOR): PaletteOptions => ({
  primary: {
    main: primaryColor,
  },
  secondary: {
    main: '#9c27b0',
  },
  success: { main: '#2e7d32' },
  error: { main: '#d32f2f' },
  warning: { main: '#ed6c02' },
  info: { main: '#0288d1' },
  background: {
    default: '#f7f9fc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#707070',
  },
});

export default getPalette;
