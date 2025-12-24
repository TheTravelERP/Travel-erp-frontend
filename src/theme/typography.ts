// src/theme/typography.ts
import type { TypographyOptions } from '@mui/material/styles';
import { tokens } from './tokens';

const typography: TypographyOptions = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',

  h1: {
    fontSize: '3rem',
    fontWeight: tokens.fontWeight.bold,
  },

  h6: {
    fontSize: '0.95rem',          // close to body1
    fontWeight: tokens.fontWeight.bold,
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },

  subtitle1: {
    fontWeight: tokens.fontWeight.bold,
  },

  body1: {
    fontSize: '1rem',
  },

  body2: {
    fontSize: '0.875rem',
  },

};

export default typography;
