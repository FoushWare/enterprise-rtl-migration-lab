import { createTheme } from "@mui/material";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";

// The public English theme remains the sole LTR configuration owner.
export const theme = createTheme({
  direction: "ltr",
  palette: {
    primary: { main: "#4c58d6" },
    background: { default: "#f7f8fb" },
    text: { primary: "#202738", secondary: "#7a8294" },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
    h4: { fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-.7px" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { padding: "10px 18px" } },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#edf0f5", padding: "17px 20px" },
        head: {
          fontSize: 11,
          fontWeight: 700,
          color: "#80889a",
          letterSpacing: ".6px",
          background: "#fafbfc",
        },
      },
    },
  },
});

export const rtlTheme = createTheme({
  direction: "rtl",
  palette: {
    primary: { main: "#4c58d6" },
    background: { default: "#f7f8fb" },
    text: { primary: "#202738", secondary: "#7a8294" },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
    h4: { fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-.7px" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { padding: "10px 18px" } },
    },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#edf0f5", padding: "17px 20px" },
        head: {
          fontSize: 11,
          fontWeight: 700,
          color: "#80889a",
          letterSpacing: ".6px",
          background: "#fafbfc",
        },
      },
    },
  },
});

// Prepared once per module; neither cache is mounted in the active Provider.
const ltrCache = createCache({ key: "css", stylisPlugins: [prefixer] });
const rtlCache = createCache({ key: "atlas-rtl", stylisPlugins: [prefixer, rtlPlugin] });
// Deliberately retain private instances for the separately approved runtime slice.
void ltrCache;
void rtlCache;
