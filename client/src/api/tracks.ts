import { createApi } from "@reduxjs/toolkit/query/react";
import { IComment, ITrack, ITrackLike } from "../types/entries/track";
import { baseQueryWithReauth } from "./baseQueryReauth";

export const tracksApi = createApi({
  reducerPath: "tracksApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["allTracks", "Track", "LikeTrack"],
  endpoints: (builder) => ({
    getAllTracks: builder.query<ITrack[], void>({
      query: () => "/tracks/all",
      providesTags: ["allTracks"],
    }),
    getTrackById: builder.query<ITrack, string>({
      query: (id) => `/tracks/${id}`,
      providesTags: ["Track"],
    }),
    getTracksBySearch: builder.query<ITrack[], string>({
      query: (query) => `/tracks/search?query=${query}`,
    }),
    getTracksLikedListUser: builder.query<ITrackLike[], void>({
      query: () => `/tracks/like/links/me`,
      providesTags: ["LikeTrack"],
    }),
    getTracksLikedUser: builder.query<ITrack[], void>({
      query: () => `/tracks/like/me`,
      providesTags: ["LikeTrack"],
    }),
    createTrack: builder.mutation<ITrack, FormData>({
      query: (formData) => {
        return {
          url: "/tracks",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["allTracks"],
    }),
    deleteTrack: builder.mutation<{ id: string }, string>({
      query: (trackId) => {
        return {
          url: `/tracks/${trackId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["allTracks"],
    }),
    createComment: builder.mutation<
      IComment,
      { text: string; trackId: string }
    >({
      query: ({ trackId, text }) => {
        return {
          url: "/comments",
          method: "POST",
          body: { trackId, text },
        };
      },
      invalidatesTags: ["Track"],
    }),
    updateComment: builder.mutation<IComment, { commentId: string; text: string }>({
      query: ({ commentId, text }) => {
        return {
          url: `/comments/${commentId}`,
          method: "PATCH",
          body: { text },
        };
      },
      invalidatesTags: ["Track"],
    }),
    deleteComment: builder.mutation<{ id: string }, { commentId: string }>({
      query: ({ commentId }) => {
        return {
          url: `/comments/${commentId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Track"],
    }),
    listenTrack: builder.mutation<void, string>({
      query: (trackId) => {
        return {
          url: `/tracks/${trackId}/listen`,
          method: "POST",
        };
      },
    }),
    likeTrack: builder.mutation<void, { trackId: string }>({
      query: (dto) => {
        return {
          url: "/tracks/like",
          method: "POST",
          body: dto,
        };
      },
      invalidatesTags: ["LikeTrack"],
    }),
  }),
});

export const {
  useGetAllTracksQuery,
  useGetTrackByIdQuery,
  useGetTracksBySearchQuery,
  useGetTracksLikedUserQuery,
  useGetTracksLikedListUserQuery,
  useCreateTrackMutation,
  useDeleteTrackMutation,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useListenTrackMutation,
  useLikeTrackMutation,
} = tracksApi;
