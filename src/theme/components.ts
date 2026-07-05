// src/theme/components.ts

import type { Components } from "@mui/material/styles";


const components: Components = {
  /* Layout */

  MuiPaper: {
    defaultProps: {
      variant: "outlined",
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

  /* Icons & Avatars */

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

  /* Buttons */

  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        minHeight: 56,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        paddingInline: 20,
      },
    },
  },
};

export default components;