"use client";

import React from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Button } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import SearchInput from "../components/searchInput/searchInput";
import TrackList from "../components/tracks/trackList";
import PlaylistCard from "../components/playlists/playlistCard";
import { useDebounce } from "../hooks/useDebounce";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { ITrack } from "../types/entries/track";
import { IPlaylist } from "../types/entries/playlist";
import { useGetAllTracksQuery, useGetTracksBySearchQuery } from "../api/tracks";
import { useGetPopularPlaylistsQuery, useSearchPlaylistsQuery } from "../api/playlists";

const PAGE_SIZE = 20;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 400).trim();
  const isSearchMode = debouncedSearch.length > 0;

  const tracksPagination = usePaginatedList<ITrack>({
    pageSize: PAGE_SIZE,
    resetDeps: [debouncedSearch],
  });
  const playlistsPagination = usePaginatedList<IPlaylist>({
    pageSize: PAGE_SIZE,
    resetDeps: [debouncedSearch],
  });

  const { data: allTracksPage, isLoading: isLoadingAllTracks } = useGetAllTracksQuery(
    !isSearchMode
      ? { limit: PAGE_SIZE, offset: tracksPagination.offset }
      : skipToken,
  );
  const { data: popularPlaylistsPage, isLoading: isLoadingPopularPlaylists } =
    useGetPopularPlaylistsQuery(
      !isSearchMode
        ? { limit: PAGE_SIZE, offset: playlistsPagination.offset }
        : skipToken,
    );

  const { data: searchTracksPage, isLoading: isLoadingSearchTracks } =
    useGetTracksBySearchQuery(
      isSearchMode
        ? {
            query: debouncedSearch,
            limit: PAGE_SIZE,
            offset: tracksPagination.offset,
          }
        : skipToken,
    );
  const { data: searchPlaylistsPage, isLoading: isLoadingSearchPlaylists } =
    useSearchPlaylistsQuery(
      isSearchMode
        ? {
            query: debouncedSearch,
            limit: PAGE_SIZE,
            offset: playlistsPagination.offset,
          }
        : skipToken,
    );

  const currentTracksPage = isSearchMode ? searchTracksPage : allTracksPage;
  const currentPlaylistsPage = isSearchMode ? searchPlaylistsPage : popularPlaylistsPage;

  React.useEffect(() => {
    tracksPagination.applyPage(currentTracksPage);
  }, [currentTracksPage, tracksPagination.applyPage]);

  React.useEffect(() => {
    playlistsPagination.applyPage(currentPlaylistsPage);
  }, [currentPlaylistsPage, playlistsPagination.applyPage]);

  const isTracksFirstLoad =
    tracksPagination.offset === 0 &&
    ((isSearchMode && isLoadingSearchTracks) || (!isSearchMode && isLoadingAllTracks));
  const isPlaylistsFirstLoad =
    playlistsPagination.offset === 0 &&
    ((isSearchMode && isLoadingSearchPlaylists) ||
      (!isSearchMode && isLoadingPopularPlaylists));

  return (
    <MainLayout>
      <header className="text-center mb-8">
        <h2 className="text-xl font-semibold text-zinc-100">
          {isSearchMode ? "Глобальный поиск" : "Главная"}
        </h2>
      </header>

      <div className="mb-8">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <section className="mb-12">
        <h3 className="text-lg font-semibold mb-4">
          {isSearchMode ? "Треки" : "Свежие треки"}
        </h3>
        {isTracksFirstLoad ? (
          <div className="text-zinc-400">Загрузка треков...</div>
        ) : (
          <TrackList tracks={tracksPagination.items} searchEnabled={false} />
        )}
        {tracksPagination.items.length > 0 && tracksPagination.hasMore && (
          <div className="mt-5 text-center">
            <Button variant="outlined" onClick={tracksPagination.loadMore}>
              Показать еще треки
            </Button>
          </div>
        )}
      </section>

      <section className="mb-25">
        <h3 className="text-lg font-semibold mb-4">
          {isSearchMode ? "Плейлисты" : "Популярные плейлисты"}
        </h3>
        {isPlaylistsFirstLoad ? (
          <div className="text-zinc-400">Загрузка плейлистов...</div>
        ) : playlistsPagination.items.length > 0 ? (
          <div className="flex flex-wrap gap-5 justify-center">
            {playlistsPagination.items.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                id={playlist._id}
                name={playlist.name}
                pictureUrl={playlist.pictureUrl}
                subscribersCount={playlist.subscribersCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-zinc-400">
            {isSearchMode ? "Плейлисты не найдены" : "Плейлисты пока не найдены"}
          </div>
        )}
        {playlistsPagination.items.length > 0 && playlistsPagination.hasMore && (
          <div className="mt-5 text-center">
            <Button variant="outlined" onClick={playlistsPagination.loadMore}>
              Показать еще плейлисты
            </Button>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
