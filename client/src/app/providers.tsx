"use client";

import { Provider, useDispatch } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "../store";
import { useEffect } from "react";
import { setUserState, logout } from "../store/slices/auth";
import { useMeQuery } from "../api/auth";
import { darkTheme } from "./theme";

export function Providers({ children }: { children: React.ReactNode }) {
  function AuthInit() {
    const dispatch = useDispatch();
    const { data, isLoading } = useMeQuery();

    useEffect(() => {
      if (data) dispatch(setUserState(data));
      else if (!isLoading) dispatch(logout());
    }, [data, isLoading, dispatch]);

    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthInit />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
