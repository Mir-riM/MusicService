import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryReauth";
import { IPlaylist, IPlaylistWithTracks } from "../types/entries/playlist";

export type UserAndPlaylistDto = {
  userId: string;
  playlistId: string;
};

export const playlistsApi = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "/playlistsApi",
  tagTypes: ["playlist"],

  endpoints: (builder) => ({
    getUserPlaylists: builder.query<IPlaylist[], string>({
      query: (id) => `playlists/user/${id}`,
    }),
    getUserPlaylistsWithTracks: builder.query<IPlaylistWithTracks, string>({
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
    }),
  }),
});

export const {
  useGetUserPlaylistsQuery,
  useGetUserPlaylistsWithTracksQuery,
  useDeleteTrackFromPlaylistMutation,
  useEditPlaylistMutation,
  useForkPlaylistMutation,
  useSubscribePlaylistMutation,
} = playlistsApi;
