import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types/entries/user";

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

export const { setUserState, logout } = authSlice.actions;
export default authSlice.reducer;
