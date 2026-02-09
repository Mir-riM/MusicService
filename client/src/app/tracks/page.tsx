"use client";
import { Button, Card, Grid } from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import React from "react";
import TrackList from "../../components/tracks/track-list";
import {
  useGetAllTracksQuery,
  useGetTracksBySearchQuery,
} from "../../api/tracks";
import SearchInput from "../../components/search-input/search-input";
import { useDebounce } from "../../hooks/useDebounce";
import { skipToken } from "@reduxjs/toolkit/query/react";

const TraksPage: React.FC = () => {
  const { data: allTracks, isLoading: isLoadingAllTracks } =
    useGetAllTracksQuery();

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: foundTracks, isLoading: isLoadingFoundTracks } =
    useGetTracksBySearchQuery(
      debouncedSearch.length > 0 ? debouncedSearch : skipToken,
    );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const tracks = debouncedSearch.length > 0 ? foundTracks : allTracks;

  return (
    <MainLayout>
      <header className="text-center mb-10">
        <h2 className="text-xl font-semibold text-zinc-100">Список треков</h2>
      </header>
      <div className="mb-25">
        {isLoadingAllTracks && <div className="text-zinc-400">Загрузка...</div>}
        {tracks && !isLoadingAllTracks && (
          <>
            <div className="mb-5">
              <SearchInput onChange={handleSearchChange} />
            </div>

            <TrackList tracks={tracks} />
          </>
        )}
        {!tracks &&
          debouncedSearch?.length > 0 &&
          !isLoadingAllTracks &&
          !isLoadingFoundTracks && (
            <div>
              <p className="text-zinc-400">
                Треки {debouncedSearch && `по запросу: ${debouncedSearch}`} не
                найдены.
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outlined"
                size="small"
              >
                Отменить поиск
              </Button>
            </div>
          )}

        {debouncedSearch?.length === 0 &&
          !tracks?.length &&
          !isLoadingAllTracks &&
          !isLoadingFoundTracks && (
            <div className="text-zinc-400">Треки не найдены</div>
          )}
      </div>
    </MainLayout>
  );
};

export default TraksPage;
