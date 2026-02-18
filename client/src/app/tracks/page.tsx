"use client";
import MainLayout from "../../layouts/MainLayout";
import React from "react";
import TrackList from "../../components/tracks/trackList";
import { useGetAllTracksQuery, useGetTracksBySearchQuery } from "../../api/tracks";
import SearchInput from "../../components/searchInput/searchInput";
import { useDebounce } from "../../hooks/useDebounce";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Button } from "@mui/material";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { ITrack } from "../../types/entries/track";

const PAGE_SIZE = 20;

const TraksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 400).trim();
  const isSearchMode = debouncedSearch.length > 0;
  const pagination = usePaginatedList<ITrack>({
    pageSize: PAGE_SIZE,
    resetDeps: [debouncedSearch],
  });

  const { data: allTracksPage, isLoading: isLoadingAllTracks } = useGetAllTracksQuery({
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });
  const { data: searchTracksPage, isLoading: isLoadingSearchTracks } =
    useGetTracksBySearchQuery(
      isSearchMode
        ? {
            query: debouncedSearch,
            limit: PAGE_SIZE,
            offset: pagination.offset,
          }
        : skipToken,
    );

  const currentPage = isSearchMode ? searchTracksPage : allTracksPage;
  React.useEffect(() => {
    pagination.applyPage(currentPage);
  }, [currentPage, pagination.applyPage]);

  const pagedTracks = pagination.items;
  const isFirstLoad =
    pagination.offset === 0 &&
    ((isSearchMode && isLoadingSearchTracks) || (!isSearchMode && isLoadingAllTracks));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <MainLayout>
      <header className="text-center mb-10">
        <h2 className="text-xl font-semibold text-zinc-100">Список треков</h2>
      </header>
      <div className="mb-25">
        <div className="mb-5">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />
        </div>

        {isFirstLoad ? (
          <div className="text-zinc-400">Загрузка...</div>
        ) : (
          <TrackList tracks={pagedTracks} searchEnabled={false} />
        )}

        {pagedTracks.length > 0 && pagination.hasMore && (
          <div className="mt-6 text-center">
            <Button variant="outlined" onClick={pagination.loadMore}>
              Показать еще
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TraksPage;
