import { configureStore } from "@reduxjs/toolkit";
import PlayerReducer from "./slices/player";
import AuthReducer from "./slices/auth";
import { tracksApi } from "../api/tracks";
import { authApi } from "../api/auth";
import { playlistsApi } from "../api/playlists";

export const store = configureStore({
  reducer: {
    player: PlayerReducer,
    auth: AuthReducer,
    [tracksApi.reducerPath]: tracksApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [playlistsApi.reducerPath]: playlistsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      tracksApi.middleware,
      authApi.middleware,
      playlistsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
