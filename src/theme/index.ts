// src/theme/index.ts
import { createTheme, type Theme } from '@mui/material/styles';
import getPalette, { DEFAULT_PRIMARY_COLOR } from './palette';
import typography from './typography';
import components from './components';

export { DEFAULT_PRIMARY_COLOR };

export const createAppTheme = (primaryColor: string = DEFAULT_PRIMARY_COLOR): Theme =>
  createTheme({
    palette: getPalette(primaryColor),
    typography,
    shape: {
      borderRadius: 1,
    },
    components,
  });

const theme = createAppTheme();

export default theme;
