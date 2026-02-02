import { configureStore } from "@reduxjs/toolkit";
import PlayerReducer from "./slices/player";
import AuthReducer from "./slices/auth";
import { tracksApi } from "../api/tracks";
import { authApi } from "../api/auth";

export const store = configureStore({
  reducer: {
    player: PlayerReducer,
    auth: AuthReducer,
    [tracksApi.reducerPath]: tracksApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tracksApi.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
