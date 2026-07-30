// src/theme/components.ts

import { alpha } from "@mui/material/styles";
import type { Components, Theme } from "@mui/material/styles";

// Single source of truth for the height of every input and button in the
// app. TextField, `<TextField select>`, and Autocomplete (DropdownAutocomplete,
// EntityAutocomplete, CountryAutocomplete) all render MuiOutlinedInput
// internally; Button/IconButton get their own explicit per-size overrides
// below. All of it keys off this one constant, regardless of whether a
// given instance passes size="small", size="medium", or nothing at all —
// to change the app-wide control height, edit this number only.
export const CONTROL_HEIGHT = 46;

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
        minHeight: CONTROL_HEIGHT,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        paddingInline: 20,
      },
      // `minHeight` on root is a floor, but MUI's own `.MuiButton-sizeSmall`/
      // `-sizeMedium`/`-sizeLarge` classes carry their own padding/line-height
      // at equal-or-higher specificity — explicit per-size overrides remove
      // any ambiguity about which one wins, instead of relying on `root`
      // alone to dominate every size variant.
      sizeSmall: { minHeight: CONTROL_HEIGHT },
      sizeMedium: { minHeight: CONTROL_HEIGHT },
      sizeLarge: { minHeight: CONTROL_HEIGHT },
    },
  },

  /* ToggleButton/ToggleButtonGroup (e.g. New/Existing, Custom/Inventory
     toggles) are a completely separate MUI component from Button — without
     this, they silently keep rendering at MUI's own native height even
     though every other button in the app follows CONTROL_HEIGHT. */

  MuiToggleButton: {
    styleOverrides: {
      root: {
        minHeight: CONTROL_HEIGHT,
        textTransform: "none",
      },
      sizeSmall: { minHeight: CONTROL_HEIGHT },
      sizeMedium: { minHeight: CONTROL_HEIGHT },
      sizeLarge: { minHeight: CONTROL_HEIGHT },
    },
  },

  /* Text inputs, Selects, Autocompletes — every one of them renders an
     OutlinedInput internally (TextField and `<TextField select>` directly;
     Autocomplete via its own render-input callback), so this single
     override is what makes every input in the app the same height,
     independent of any `size` prop a caller does or doesn't pass. Multiline
     fields (message bodies, notes, addresses) are excluded so they can
     still grow with `rows`.

     Vertical centering is done with flexbox (`alignItems: center`) rather
     than a hand-picked padding number — a fixed padding value only centers
     text correctly for the ONE height it was measured against, so changing
     CONTROL_HEIGHT would silently throw text off-center again. Flexbox
     centers the input row regardless of what CONTROL_HEIGHT is set to,
     so the two stay in sync automatically with nothing to keep in sync
     by hand. `paddingTop/Bottom: 0` on the input removes MUI's own
     built-in vertical padding (which is what was fighting the flex
     centering — that padding pushes content instead of centering it). */

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        "&:not(.MuiInputBase-multiline)": {
          height: CONTROL_HEIGHT,
          display: "flex",
          alignItems: "center",
        },
      },
      input: {
        "&:not(textarea)": {
          paddingTop: 0,
          paddingBottom: 0,
          height: "auto",
        },
      },
    },
  },

  /* The label MUI shows resting inside an empty, unfocused field (visually
     the "placeholder") isn't a flex child of MuiOutlinedInput-root — it's
     positioned separately via a hardcoded `transform: translate(14px, 16px)`
     baked into MUI's own outlined-input label styles, tuned for MUI's native
     56px box. It doesn't know about CONTROL_HEIGHT, so it stays pinned 16px
     from the top regardless of the box's actual height, leaving unequal
     top/bottom gaps once CONTROL_HEIGHT differs from 56. Recompute the same
     offset from CONTROL_HEIGHT instead: 23 is the measured line-height of the
     label/input text at the app's default 16px font, so (CONTROL_HEIGHT-23)/2
     centers it exactly, same as the flexbox centering above — one number to
     keep in sync, not two. Only the resting (unshrunk, not-focused, no value)
     state is targeted; the shrunk floating-label state is unaffected. */

  MuiInputLabel: {
    styleOverrides: {
      root: {
        "&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
          transform: `translate(14px, ${(CONTROL_HEIGHT - 23) / 2}px) scale(1)`,
        },
      },
    },
  },
};

export default components;