"use client";

import { Provider, useDispatch } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "../store";
import { useEffect } from "react";
import { setUserState, logout } from "../store/slices/auth";
import { useMeQuery } from "../api/auth";
import { darkTheme } from "./theme";
import { SnackbarProvider } from "notistack";

export function Providers({ children }: { children: React.ReactNode }) {
  function AuthInit() {
    const dispatch = useDispatch();
    const { data, isLoading, isUninitialized } = useMeQuery();

    useEffect(() => {
      if (isLoading || isUninitialized) return;

      if (data) dispatch(setUserState(data));
      else dispatch(logout());
    }, [data, isLoading, isUninitialized, dispatch]);

    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <CssBaseline />
          <AuthInit />
          {children}
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}
