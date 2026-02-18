import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryReauth";
import {
  IPlaylist,
  IPlaylistWithTrackLinks,
  IPlaylistWithTracks,
} from "../types/entries/playlist";
import { PaginatedResponse } from "../types/common/pagination";

export type UserAndPlaylistDto = {
  playlistId: string;
};
export type TrackAndPlaylistDto = {
  trackId: string;
  playlistId: string;
};
export type PlaylistTrackUserDto = {
  trackId: string;
  playlistId: string;
};

export const playlistsApi = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "/playlistsApi",
  tagTypes: ["playlist", "userPlaylists", "playlistTrackLink", "playlistSubscriptionStatus"],

  endpoints: (builder) => ({
    getUserPlaylists: builder.query<
      PaginatedResponse<IPlaylist>,
      { limit?: number; offset?: number } | void
    >({
      query: (args) => {
        const limit = args?.limit ?? 20;
        const offset = args?.offset ?? 0;
        return `playlists/user/me?limit=${limit}&offset=${offset}`;
      },
      providesTags: ["userPlaylists"],
    }),
    getPopularPlaylists: builder.query<
      PaginatedResponse<IPlaylist>,
      { limit?: number; offset?: number } | void
    >({
      query: (args) => {
        const limit = args?.limit ?? 20;
        const offset = args?.offset ?? 0;
        return `playlists/popular?limit=${limit}&offset=${offset}`;
      },
    }),
    searchPlaylists: builder.query<
      PaginatedResponse<IPlaylist>,
      { query: string; limit?: number; offset?: number }
    >({
      query: ({ query, limit = 20, offset = 0 }) =>
        `playlists/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
    }),
    getUserPlaylistWithTracks: builder.query<
      IPlaylistWithTracks,
      { id: string; limit?: number; offset?: number }
    >({
      query: ({ id, limit = 20, offset = 0 }) =>
        `playlists/${id}?limit=${limit}&offset=${offset}`,
      providesTags: (result, error, arg) => [{ type: "playlist", id: arg.id }],
    }),
    getPlaylistSubscriptionStatus: builder.query<{ isSubscribed: boolean }, string>({
      query: (playlistId) => `playlists/${playlistId}/subscription/me`,
      providesTags: (result, error, playlistId) => [
        { type: "playlistSubscriptionStatus", id: playlistId },
      ],
    }),

    getPlaylistTrackLink: builder.query<IPlaylistWithTrackLinks[], void>({
      query: () => `playlists/track/link/me`,
      providesTags: ["playlistTrackLink"],
    }),

    toggleTrackInPlaylist: builder.mutation<
      { included: boolean },
      PlaylistTrackUserDto
    >({
      query: (dto) => {
        return {
          url: "playlists/toggle/track",
          method: "POST",
          body: dto,
        };
      },
      invalidatesTags: (result, error, dto) => [
        "playlistTrackLink",
        { type: "playlist", id: dto.playlistId },
      ],
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
    deletePlaylist: builder.mutation<{ id: string }, string>({
      query: (playlistId) => {
        return {
          url: `/playlists/${playlistId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["userPlaylists"],
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
      invalidatesTags: (result, error, dto) => [
        "userPlaylists",
        { type: "playlist", id: dto.playlistId },
        { type: "playlistSubscriptionStatus", id: dto.playlistId },
      ],
    }),
  }),
});

export const {
  useGetUserPlaylistsQuery,
  useGetPopularPlaylistsQuery,
  useSearchPlaylistsQuery,
  useGetUserPlaylistWithTracksQuery,
  useGetPlaylistSubscriptionStatusQuery,
  useGetPlaylistTrackLinkQuery,
  useToggleTrackInPlaylistMutation,
  useEditPlaylistMutation,
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  useForkPlaylistMutation,
  useSubscribePlaylistMutation,
} = playlistsApi;
