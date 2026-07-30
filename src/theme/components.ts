// src/theme/components.ts

import { alpha } from "@mui/material/styles";
import type { Components, Theme } from "@mui/material/styles";


const components: Components<Theme> = {
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

  /* Navigation */

  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&.Mui-selected": {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
          },
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
        },
      }),
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