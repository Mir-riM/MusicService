"use client";
import { useRouter } from "next/navigation";
import { useGetUserPlaylistsQuery } from "../../api/playlists";
import {
  useGetAllTracksQuery,
  useGetTracksLikedUserQuery,
} from "../../api/tracks";
import TrackList from "../../components/tracks/trackList";
import { AuthGuard } from "../../guards/authGuard";
import MainLayout from "../../layouts/MainLayout";
import { useAppSelector } from "../../hooks/store";
import PlaylistCard from "../../components/playlists/playlistCard";
import { useEffect } from "react";
import { Card } from "@mui/material";
import { Add } from "@mui/icons-material";

const CollectionPage = () => {
  const router = useRouter();

  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const { data: playlists } = useGetUserPlaylistsQuery(undefined, {
    skip: !user,
  });
  const { data: likedTracks } = useGetTracksLikedUserQuery(undefined, {
    skip: !user,
  });

  return (
    <AuthGuard>
      <MainLayout>
        <div className="text-center">
          <h2 className="text-3xl font-black">Коллекция</h2>
        </div>
        <div className="mt-10 flex flex-col gap-5">
          <h3 className="font-2xl font-bold">Понравившиеся</h3>
          {likedTracks && likedTracks?.length > 0 ? (
            <TrackList tracks={likedTracks} />
          ) : (
            <p>Вы пока не добавляли треки...</p>
          )}
        </div>
        <div className="mt-10 mb-30">
          <h3 className="font-2xl font-bold">Плейлисты</h3>
          <div className="flex flex-wrap gap-5 mt-5 justify-center">
            <Card
              onClick={() => router.push(`/playlists/create`)}
              className="w-full max-w-60 p-5 rounded-4xl shadow cursor-pointer"
            >
              <div className="w-full h-dvh max-w-50 max-h-50">
                <div className="w-full h-full bg-gray-800 flex justify-center items-center">
                  <Add color="primary" fontSize="large" />
                </div>
              </div>
              <h6 className="font-semibold mt-5 text-xl text-center">
                Создать плейлист
              </h6>
            </Card>
            {playlists ? (
              playlists.map((playlist, index) => (
                <PlaylistCard
                  key={index}
                  id={playlist._id}
                  pictureUrl={playlist.pictureUrl}
                  name={playlist.name}
                />
              ))
            ) : (
              <p>Вы пока не добавляли плейлисты...</p>
            )}
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default CollectionPage;
