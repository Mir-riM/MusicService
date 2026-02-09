import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQueryReauth";
import {
  IPlaylist,
  IPlaylistWithTrackLinks,
  IPlaylistWithTracks,
} from "../types/entries/playlist";

export type UserAndPlaylistDto = {
  userId: string;
  playlistId: string;
};
export type TrackAndPlaylistDto = {
  trackId: string;
  playlistId: string;
};
export type PlaylistTrackUserDto = {
  trackId: string;
  playlistId: string;
  userId: string;
};

export const playlistsApi = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "/playlistsApi",
  tagTypes: ["playlist", "userPlaylists", "playlistTrackLink"],

  endpoints: (builder) => ({
    getUserPlaylists: builder.query<IPlaylist[], string>({
      query: (id) => `playlists/user/${id}`,
      providesTags: (result, error, id) => [{ type: "userPlaylists", id }],
    }),
    getUserPlaylistWithTracks: builder.query<IPlaylistWithTracks, string>({
      query: (id) => `playlists/${id}`,
      providesTags: (result, error, id) => [{ type: "playlist", id }],
    }),

    getPlaylistTrackLink: builder.query<IPlaylistWithTrackLinks[], string>({
      query: (id) => `playlists/${id}/track/link`,
      providesTags: (result, error, id) => [{ type: "playlistTrackLink", id }],
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
        { type: "playlistTrackLink", id: dto.userId },
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
  useGetPlaylistTrackLinkQuery,
  useToggleTrackInPlaylistMutation,
  useEditPlaylistMutation,
  useCreatePlaylistMutation,
  useForkPlaylistMutation,
  useSubscribePlaylistMutation,
} = playlistsApi;
