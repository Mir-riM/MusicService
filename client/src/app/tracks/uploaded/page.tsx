"use client";

import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import MainLayout from "../../../layouts/MainLayout";
import { AuthGuard } from "../../../guards/authGuard";
import TrackList from "../../../components/tracks/trackList";
import { usePaginatedList } from "../../../hooks/usePaginatedList";
import { ITrack } from "../../../types/entries/track";
import { useGetUploadedTracksQuery } from "../../../api/tracks";
import { useEffect } from "react";

const PAGE_SIZE = 20;

const UploadedTracksPage = () => {
  const router = useRouter();
  const pagination = usePaginatedList<ITrack>({
    pageSize: PAGE_SIZE,
    resetDeps: [],
  });

  const { data: uploadedTracksPage, isLoading } = useGetUploadedTracksQuery({
    limit: PAGE_SIZE,
    offset: pagination.offset,
  });

  useEffect(() => {
    pagination.applyPage(uploadedTracksPage);
  }, [uploadedTracksPage, pagination.applyPage]);

  const isFirstLoad = pagination.offset === 0 && isLoading;

  return (
    <AuthGuard>
      <MainLayout>
        <header className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-100">Загруженные треки</h2>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push("/tracks/create")}
          >
            Добавить трек
          </Button>
        </header>

        {isFirstLoad ? (
          <div className="text-zinc-400">Загрузка...</div>
        ) : pagination.items.length > 0 ? (
          <>
            <TrackList tracks={pagination.items} searchEnabled={false} />
            {pagination.hasMore && (
              <div className="mt-5 text-center">
                <Button variant="outlined" onClick={pagination.loadMore}>
                  Показать еще
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-zinc-400">Вы еще не загружали треки</div>
        )}
      </MainLayout>
    </AuthGuard>
  );
};

export default UploadedTracksPage;
