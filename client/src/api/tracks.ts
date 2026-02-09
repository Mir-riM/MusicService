import { createApi } from "@reduxjs/toolkit/query/react";
import { IComment, ITrack, ITrackLike } from "../types/entries/track";
import { baseQueryWithReauth } from "./baseQueryReauth";

export const tracksApi = createApi({
  reducerPath: "tracksApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["allTracks", "Track"],
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
    getTracksLikedUser: builder.query<ITrackLike[], string>({
      query: (id) => `/tracks/likes/${id}`,
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
    createComment: builder.mutation<
      IComment,
      { username: string; text: string; trackId: string }
    >({
      query: ({ username, trackId, text }) => {
        return {
          url: "/tracks/comment",
          method: "POST",
          body: { username, trackId, text },
        };
      },
      invalidatesTags: ["Track"],
    }),
  }),
});

export const {
  useGetAllTracksQuery,
  useGetTrackByIdQuery,
  useGetTracksBySearchQuery,
  useCreateTrackMutation,
  useCreateCommentMutation,
} = tracksApi;
