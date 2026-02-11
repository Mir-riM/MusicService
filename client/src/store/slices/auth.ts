import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types/entries/user";
import { RootState } from "..";
import { ITrackLike } from "../../types/entries/track";

type AuthState = {
  user: IUser | null;
  initialized: boolean;
  userLikedTracks: ITrackLike[] | null;
};

const initialState: AuthState = {
  user: null,
  initialized: false,
  userLikedTracks: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserState(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      state.initialized = true;
    },
    setUserLikedTracks(state, action: PayloadAction<ITrackLike[]>) {
      state.userLikedTracks = action.payload;
    },
    logout(state) {
      state.user = null;
      state.initialized = true;
    },
  },
});

export const selectIsAuth = (state: RootState) =>
  state.auth.initialized && !!state.auth.user;
export const selectAuthInitialized = (state: RootState) =>
  state.auth.initialized;
export const selectUserLikedTracks = (state: RootState) =>
  state.auth.userLikedTracks;

export const { setUserState, logout, setUserLikedTracks } = authSlice.actions;
export default authSlice.reducer;
