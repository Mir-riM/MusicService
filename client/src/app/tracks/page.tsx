"use client";
import MainLayout from "../../layouts/MainLayout";
import React from "react";
import TrackList from "../../components/tracks/trackList";
import { useGetAllTracksQuery } from "../../api/tracks";

const TraksPage: React.FC = () => {
  const { data: allTracks, isLoading: isLoadingAllTracks } =
    useGetAllTracksQuery();

  const tracks = allTracks ?? [];

  return (
    <MainLayout>
      <header className="text-center mb-10">
        <h2 className="text-xl font-semibold text-zinc-100">Список треков</h2>
      </header>
      <div className="mb-25">
        {isLoadingAllTracks && <div className="text-zinc-400">Загрузка...</div>}
        {!isLoadingAllTracks && <TrackList tracks={tracks} />}
      </div>
    </MainLayout>
  );
};

export default TraksPage;
