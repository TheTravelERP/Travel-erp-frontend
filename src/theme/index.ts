// src/theme/index.ts
import { createTheme } from "@mui/material/styles";
import palette from "./palette";
import typography from "./typography";

const theme = createTheme({
  palette,
  typography,
  shape: {
    // borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
        //   borderRadius: 8,
        //   fontWeight: 600,
        },
      },
    },
  },
});

export default theme;


// import { createTheme } from '@mui/material/styles';
// const theme = createTheme({});
// export default theme;
