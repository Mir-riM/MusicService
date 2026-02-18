"use client";
import { useRouter } from "next/navigation";
import { useGetUserPlaylistsQuery } from "../../api/playlists";
import {
  useGetTracksLikedUserQuery,
} from "../../api/tracks";
import TrackList from "../../components/tracks/trackList";
import { AuthGuard } from "../../guards/authGuard";
import MainLayout from "../../layouts/MainLayout";
import { useAppSelector } from "../../hooks/store";
import PlaylistCard from "../../components/playlists/playlistCard";
import { useEffect } from "react";
import { Button, Card } from "@mui/material";
import { Add } from "@mui/icons-material";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { ITrack } from "../../types/entries/track";
import { IPlaylist } from "../../types/entries/playlist";

const PAGE_SIZE = 20;

const CollectionPage = () => {
  const router = useRouter();

  const { user, initialized } = useAppSelector((state) => state.auth);
  const likedPagination = usePaginatedList<ITrack>({
    pageSize: PAGE_SIZE,
    resetDeps: [user?._id],
  });
  const playlistsPagination = usePaginatedList<IPlaylist>({
    pageSize: PAGE_SIZE,
    resetDeps: [user?._id],
  });

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const { data: playlistsPage } = useGetUserPlaylistsQuery(
    { limit: PAGE_SIZE, offset: playlistsPagination.offset },
    {
      skip: !user,
    },
  );
  const { data: likedTracksPage } = useGetTracksLikedUserQuery(
    { limit: PAGE_SIZE, offset: likedPagination.offset },
    {
      skip: !user,
    },
  );

  useEffect(() => {
    likedPagination.applyPage(likedTracksPage);
  }, [likedTracksPage, likedPagination.applyPage]);

  useEffect(() => {
    playlistsPagination.applyPage(playlistsPage);
  }, [playlistsPage, playlistsPagination.applyPage]);

  return (
    <AuthGuard>
      <MainLayout>
        <div className="text-center">
          <h2 className="text-3xl font-black">Коллекция</h2>
        </div>
        <div className="mt-10 flex flex-col gap-5">
          <h3 className="font-2xl font-bold">Понравившиеся</h3>
          {likedPagination.items.length > 0 ? (
            <>
              <TrackList tracks={likedPagination.items} searchEnabled={false} />
              {likedPagination.hasMore && (
                <div className="text-center">
                  <Button variant="outlined" onClick={likedPagination.loadMore}>
                    Показать еще
                  </Button>
                </div>
              )}
            </>
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
            {playlistsPagination.items.length > 0 ? (
              playlistsPagination.items.map((playlist, index) => (
                <PlaylistCard
                  key={index}
                  id={playlist._id}
                  pictureUrl={playlist.pictureUrl}
                  name={playlist.name}
                  subscribersCount={playlist.subscribersCount}
                />
              ))
            ) : (
              <p>Вы пока не добавляли плейлисты...</p>
            )}
          </div>
          {playlistsPagination.hasMore && (
            <div className="text-center mt-5">
              <Button variant="outlined" onClick={playlistsPagination.loadMore}>
                Показать еще
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
};

export default CollectionPage;
