"use client";
import { MusicNote } from "@mui/icons-material";
import { useGetUserPlaylistsWithTracksQuery } from "../../../api/playlists";
import MainLayout from "../../../layouts/MainLayout";
import { useParams } from "next/navigation";
import TrackList from "../../../components/tracks/track-list";
import { useEffect, useState } from "react";
import { ITrack } from "../../../types/entries/track";

const PlaylistPage = () => {
  const params = useParams<{ id: string }>();

  const { data: playlist, isLoading: isLoadingPlaylist } =
    useGetUserPlaylistsWithTracksQuery(params.id);

  const [tracks, setTracks] = useState<ITrack[]>([]);

  useEffect(() => {
    if (!isLoadingPlaylist && playlist) {
      setTracks(playlist.tracks.map((pt) => pt.track));
    }
  }, [isLoadingPlaylist, playlist]);

  return (
    <MainLayout>
      <div className="flex gap-10">
        {playlist?.pictureUrl ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${playlist.pictureUrl}`}
            alt="Playlist cover"
          />
        ) : (
          <div className="bg-gray-800 w-40 h-40 rounded-md flex items-center justify-center">
            <MusicNote color="primary" fontSize="large" />
          </div>
        )}
        <h2 className="font-black text-3xl my-auto">
          {playlist?.name ?? "Название плейлиста"}
        </h2>
      </div>

      <div className="mt-10">
        {tracks ? (
          <TrackList tracks={tracks} />
        ) : (
          <p>В этом плейлисте пока нет треков...</p>
        )}
      </div>
    </MainLayout>
  );
};

export default PlaylistPage;
