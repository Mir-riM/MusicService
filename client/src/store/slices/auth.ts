import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types/entries/user";
import { RootState } from "..";

type AuthState = {
  user: IUser | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserState(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      state.initialized = true;
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

export const { setUserState, logout } = authSlice.actions;
export default authSlice.reducer;
