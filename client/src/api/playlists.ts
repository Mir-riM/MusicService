import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryReauth";
import { IPlaylist, IPlaylistWithTracks } from "../types/entries/playlist";

export const playlistsApi = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "/playlistsApi",
  endpoints: (builder) => ({
    getUserPlaylists: builder.query<IPlaylist[], string>({
      query: (id) => `playlists/user/${id}`,
    }),
    getUserPlaylistsWithTracks: builder.query<IPlaylistWithTracks, string>({
      query: (id) => `playlists/${id}`,
    }),
  }),
});

export const { useGetUserPlaylistsQuery, useGetUserPlaylistsWithTracksQuery } =
  playlistsApi;
