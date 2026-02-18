"use client";
import MainLayout from "../../layouts/MainLayout";
import React from "react";
import TrackList from "../../components/tracks/trackList";
import { useGetAllTracksQuery } from "../../api/tracks";
import { Button } from "@mui/material";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { ITrack } from "../../types/entries/track";

const PAGE_SIZE = 20;

const TraksPage: React.FC = () => {
  const pagination = usePaginatedList<ITrack>({
    pageSize: PAGE_SIZE,
    resetDeps: [],
  });

  const { data: allTracksPage, isLoading: isLoadingAllTracks } = useGetAllTracksQuery({
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });

  const currentPage = allTracksPage;
  React.useEffect(() => {
    pagination.applyPage(currentPage);
  }, [currentPage, pagination.applyPage]);

  const pagedTracks = pagination.items;
  const isFirstLoad = pagination.offset === 0 && isLoadingAllTracks;

  return (
    <MainLayout>
      <header className="text-center mb-10">
        <h2 className="text-xl font-semibold text-zinc-100">Список треков</h2>
      </header>
      <div className="mb-25">
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
