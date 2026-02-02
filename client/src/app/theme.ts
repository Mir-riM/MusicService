import { createTheme } from "@mui/material/styles";

export const fontFamily = 'var(--font-manrope), system-ui, sans-serif';

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#18181b",
      paper: "#27272a",
    },
    primary: {
      main: "#a1a1aa",
    },
  },
  typography: {
    fontFamily,
  },
});
