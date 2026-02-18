"use client";

import {
  Edit,
  ForkLeft,
  MusicNote,
  LockOpen,
  Unsubscribe,
  Lock,
  Save,
  Cancel,
  Subscriptions,
} from "@mui/icons-material";
import { Button, TextField, Switch } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "../../../layouts/MainLayout";
import TrackList from "../../../components/tracks/trackList";
import FileUpload from "../../../components/fileUpload/fileUpload";
import {
  useEditPlaylistMutation,
  useForkPlaylistMutation,
  useGetUserPlaylistsQuery,
  useGetUserPlaylistWithTracksQuery,
  useSubscribePlaylistMutation,
} from "../../../api/playlists";
import { ITrack } from "../../../types/entries/track";
import { PlaylistEditForm, playlistEditSchema } from "../../../shared/schemas/playlistEditSchema";
import { applyApiErrorToForm } from "../../../shared/errors/apply-api-error-to-form";
import { parseApiError } from "../../../shared/errors/parse-api-error";
import { useAppSelector } from "../../../hooks/store";

const PlaylistPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [mode, setMode] = useState<"view" | "edit">("view");
  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const { data: playlist, isLoading: playlistIsLoading } =
    useGetUserPlaylistWithTracksQuery(params.id);

  const { data: allUserPlaylists } = useGetUserPlaylistsQuery(user?._id!, {
    skip: !user?._id,
  });

  const isSubscribed = useMemo(
    () => allUserPlaylists?.some((item) => item._id === playlist?._id),
    [allUserPlaylists, playlist?._id],
  );

  const [editRequest, { isLoading: editRequestIsLoading }] =
    useEditPlaylistMutation();
  const [forkRequest, { isLoading: forkRequestIsLoading }] =
    useForkPlaylistMutation();
  const [subscribeRequest, { isLoading: subscribeRequestIsLoading }] =
    useSubscribePlaylistMutation();

  const [tracks, setTracks] = useState<ITrack[]>([]);

  const {
    register: editForm,
    handleSubmit: editHandleSubmit,
    reset,
    control,
    watch,
    setError: setEditPlaylistRequestError,
    formState: {
      errors: editPlaylistErrors,
      isValid: authIsValid,
      isDirty: editFormIsDirty,
    },
  } = useForm<PlaylistEditForm>({
    resolver: zodResolver(playlistEditSchema),
    defaultValues: {
      name: "",
      isPublic: true,
      picture: undefined,
    },
  });

  useEffect(() => {
    if (!playlistIsLoading && playlist) {
      setTracks(playlist.tracks.map((pt) => pt.track));

      reset({
        name: playlist.name,
        isPublic: playlist.isPublic,
        picture: undefined,
      });
    }
  }, [playlistIsLoading, playlist, reset]);

  const picture = watch("picture");

  const coverSrc = useMemo(() => {
    if (picture instanceof File) {
      return URL.createObjectURL(picture);
    }

    if (playlist?.pictureUrl) {
      return `${process.env.NEXT_PUBLIC_MINIO_URL}/${playlist.pictureUrl}`;
    }

    return null;
  }, [picture, playlist?.pictureUrl]);

  useEffect(() => {
    return () => {
      if (picture instanceof File) {
        URL.revokeObjectURL(coverSrc!);
      }
    };
  }, [coverSrc, picture]);

  async function handlerEditPlaylist(data: PlaylistEditForm) {
    if (editFormIsDirty) {
      try {
        const formData = new FormData();
        formData.append("userId", user!._id);
        formData.append("playlistId", playlist!._id);
        formData.append("isPublic", String(data.isPublic));
        formData.append("name", data.name);
        if (data.picture) formData.append("picture", data.picture);

        await editRequest(formData).unwrap();

        setMode("view");
      } catch (error) {
        const apiError = parseApiError(error);

        if (apiError) {
          applyApiErrorToForm<PlaylistEditForm>(
            apiError,
            setEditPlaylistRequestError,
          );
        }
      }
    } else {
      setMode("view");
    }
  }

  async function forkHandler() {
    try {
      const result = await forkRequest({
        userId: user!._id,
        playlistId: playlist!._id,
      });

      router.push(`/playlists/${result.data?.playlistId}`);
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError?.message);
    }
  }

  async function subscribeHandler() {
    try {
      const result = await subscribeRequest({
        userId: user!._id,
        playlistId: playlist!._id,
      });
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError?.message);
    }
  }

  return (
    <MainLayout>
      <form
        onSubmit={editHandleSubmit(handlerEditPlaylist)}
        className="flex gap-5 items-center justify-between"
      >
        <div className="flex gap-10">
          <div className="relative">
            {coverSrc ? (
              <img
                src={coverSrc}
                className="w-40 h-40 object-cover rounded-md"
                alt="Playlist cover"
              />
            ) : (
              <div className="bg-gray-800 w-40 h-40 rounded-md flex items-center justify-center">
                <MusicNote color="primary" fontSize="large" />
              </div>
            )}

            {mode === "edit" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                <Controller
                  control={control}
                  name="picture"
                  render={({ field }) => (
                    <FileUpload
                      accept="image/*"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <Button size="small" variant="contained">
                        Загрузить
                      </Button>
                    </FileUpload>
                  )}
                />
              </div>
            )}
          </div>

          <div className="my-auto flex flex-col gap-3">
            {mode === "edit" ? (
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            ) : (
              <h2 className="font-black text-3xl">{playlist?.name}</h2>
            )}

            <div className="flex items-center gap-2">
              {mode === "edit" ? (
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field }) => (
                    <>
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <span className="text-sm">
                        {field.value ? "Публичный" : "Приватный"}
                      </span>
                    </>
                  )}
                />
              ) : (
                <>
                  {playlist?.isPublic ? (
                    <LockOpen fontSize="small" />
                  ) : (
                    <Lock fontSize="small" />
                  )}
                  <p>{playlist?.isPublic ? "Публичный" : "Приватный"}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-end">
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              {mode === "edit" && (
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  type="submit"
                  disabled={editRequestIsLoading}
                >
                  Сохранить
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={mode === "view" ? <Edit /> : <Cancel />}
                onClick={() => {
                  reset({
                    name: playlist?.name,
                    isPublic: playlist?.isPublic,
                    picture: undefined,
                  });
                  setMode((m) => (m === "view" ? "edit" : "view"));
                }}
              >
                {mode === "view" ? "Редактировать" : "Отменить"}
              </Button>
            </div>
            {editPlaylistErrors.root && (
              <p className="text-red-500 text-sm text-center">
                {editPlaylistErrors.root.message ||
                  "Произошла ошибка на сервере"}
              </p>
            )}
          </div>

          <Button
            variant="outlined"
            onClick={() => forkHandler()}
            startIcon={<ForkLeft />}
            disabled={forkRequestIsLoading}
          >
            Форкнуть
          </Button>

          <Button
            onClick={() => subscribeHandler()}
            variant="outlined"
            startIcon={isSubscribed ? <Unsubscribe /> : <Subscriptions />}
            disabled={subscribeRequestIsLoading}
          >
            {isSubscribed ? "Отписаться" : "Подписаться"}
          </Button>
        </div>
      </form>

      <div className="mt-10">
        {tracks.length ? (
          <TrackList tracks={tracks} />
        ) : (
          <p>В этом плейлисте пока нет треков…</p>
        )}
      </div>
    </MainLayout>
  );
};

export default PlaylistPage;
