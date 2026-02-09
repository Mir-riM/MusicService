import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryReauth";
import { IPlaylist, IPlaylistWithTracks } from "../types/entries/playlist";
import { dot } from "node:test/reporters";

export type UserAndPlaylistDto = {
  userId: string;
  playlistId: string;
};

export const playlistsApi = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "/playlistsApi",
  tagTypes: ["playlist", "userPlaylists"],

  endpoints: (builder) => ({
    getUserPlaylists: builder.query<IPlaylist[], string>({
      query: (id) => `playlists/user/${id}`,
      providesTags: (result, error, id) => [{ type: "userPlaylists", id }],
    }),
    getUserPlaylistWithTracks: builder.query<IPlaylistWithTracks, string>({
      query: (id) => `playlists/${id}`,
      providesTags: (result, error, id) => [{ type: "playlist", id }],
    }),
    deleteTrackFromPlaylist: builder.mutation<
      IPlaylistWithTracks,
      UserAndPlaylistDto
    >({
      query: (dto) => {
        return {
          url: "playlists/delete/track",
          method: "DELETE",
          body: dto,
        };
      },
    }),

    addTrackToPlaylist: builder.mutation<
      IPlaylistWithTracks,
      UserAndPlaylistDto
    >({
      query: (dto) => {
        return {
          url: "playlists/add/track",
          method: "POST",
          body: dto,
        };
      },
    }),

    editPlaylist: builder.mutation<void, FormData>({
      query: (dto) => {
        return {
          url: "/playlists/edit",
          method: "PATCH",
          body: dto,
        };
      },
      invalidatesTags: (result, error, formData) => [
        { type: "playlist", id: formData.get("playlistId") as string },
      ],
    }),
    createPlaylist: builder.mutation<IPlaylist, FormData>({
      query: (dto) => {
        return {
          url: "/playlists",
          method: "POST",
          body: dto,
        };
      },
    }),

    forkPlaylist: builder.mutation<{ playlistId: string }, UserAndPlaylistDto>({
      query: (dto) => {
        return {
          url: "/playlists/fork",
          method: "POST",
          body: dto,
        };
      },
    }),
    subscribePlaylist: builder.mutation<void, UserAndPlaylistDto>({
      query: (dto) => {
        return {
          url: "/playlists/subscribe",
          method: "POST",
          body: dto,
        };
      },
      invalidatesTags: (resut, error, dto) => [ 
        { type: "userPlaylists", id: dto.userId },
      ],
    }),
  }),
});

export const {
  useGetUserPlaylistsQuery,
  useGetUserPlaylistWithTracksQuery,
  useDeleteTrackFromPlaylistMutation,
  useEditPlaylistMutation,
  useCreatePlaylistMutation,
  useForkPlaylistMutation,
  useSubscribePlaylistMutation,
} = playlistsApi;
