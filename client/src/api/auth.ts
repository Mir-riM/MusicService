import { createApi } from "@reduxjs/toolkit/query/react";
import { IUser } from "../types/entries/user";
import { baseQueryWithReauth } from "./baseQueryReauth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["allTracks", "Track"],
  endpoints: (builder) => ({
    register: builder.mutation<IUser, { login: string; password: string }>({
      query: ({ login, password }) => {
        return {
          url: "/auth/register",
          method: "POST",
          body: { login, password },
        };
      },
    }),
    login: builder.mutation<IUser, { login: string; password: string }>({
      query: ({ login, password }) => {
        return {
          url: "/auth/login",
          method: "POST",
          body: { login, password },
        };
      },
    }),
    me: builder.query<IUser, void>({
      query: () => "auth/me",
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useMeQuery } = authApi;
