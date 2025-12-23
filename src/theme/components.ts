import type { Components } from '@mui/material/styles';
import { tokens } from './tokens';

const components: Components = {
  /* Layout */

  MuiPaper: {
    defaultProps: {
      variant: 'outlined',
    },
  },

  MuiToolbar: {
    styleOverrides: {
      root: {
        
        paddingLeft: 16,
        paddingRight: 16,
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },

  /* Icons & avatars are safe */

  MuiIconButton: {
    styleOverrides: {
      root: {
        padding: 8,
      },
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        width: 36,
        height: 36,
      },
    },
  },
};

export default components;
