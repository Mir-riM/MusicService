"use client";
import { useRouter } from "next/navigation";
import { useGetUserPlaylistsQuery } from "../../api/playlists";
import { useGetAllTracksQuery } from "../../api/tracks";
import TrackList from "../../components/tracks/trackList";
import { AuthGuard } from "../../guards/authGuard";
import MainLayout from "../../layouts/MainLayout";
import { useAppSelector } from "../../hooks/store";
import PlaylistCard from "../../components/playlists/playlist-card";
import { useEffect } from "react";

const CollectionPage = () => {
  const router = useRouter();

  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const { data: tracks } = useGetAllTracksQuery();
  const { data: playlists } = useGetUserPlaylistsQuery(user?._id ?? "", {
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
          {tracks ? (
            <TrackList tracks={tracks} />
          ) : (
            <p>Вы пока не добавляли треки...</p>
          )}
        </div>
        <div className="mt-10 mb-30">
          <h3 className="font-2xl font-bold">Плейлисты</h3>
          <div className="flex flex-wrap gap-5 mt-5 justify-center">
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
