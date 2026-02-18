"use client";

import { Provider, useDispatch } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "../store";
import { useEffect } from "react";
import {
  setUserState,
  logout,
  selectUserLikedTracks,
  setUserLikedTracks,
} from "../store/slices/auth";
import { useMeQuery } from "../api/auth";
import { darkTheme } from "./theme";
import { SnackbarProvider } from "notistack";
import { useGetTracksLikedListUserQuery } from "../api/tracks";

export function Providers({ children }: { children: React.ReactNode }) {
  function AuthInit() {
    const dispatch = useDispatch();
    
    const {
      data: user,
      isLoading: userIsLoading,
      isUninitialized,
    } = useMeQuery();

    const { data: userLikedTracks, isLoading: userLikedTracksIsLoading } =
      useGetTracksLikedListUserQuery(undefined, {
        skip: !user?._id,
      });

    useEffect(() => {
      if (userIsLoading || isUninitialized) return;

      if (user) dispatch(setUserState(user));
      else dispatch(logout());
    }, [user, userIsLoading, isUninitialized, dispatch]);

    useEffect(() => {
      if (!userLikedTracks) {
        return;
      }

      dispatch(setUserLikedTracks(userLikedTracks));
    }, [user, userIsLoading, userLikedTracks, userLikedTracksIsLoading]);

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
