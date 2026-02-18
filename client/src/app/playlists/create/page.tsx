"use client";

import { MusicNote, Save, Cancel } from "@mui/icons-material";
import { Button, TextField, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "../../../layouts/MainLayout";
import FileUpload from "../../../components/fileUpload/fileUpload";
import { useCreatePlaylistMutation } from "../../../api/playlists";
import { applyApiErrorToForm } from "../../../shared/errors/apply-api-error-to-form";
import { parseApiError } from "../../../shared/errors/parse-api-error";
import { useAppSelector } from "../../../hooks/store";
import {
  PlaylistCreateForm,
  playlistCreateSchema,
} from "../../../shared/schemas/createPlaylistSchema";
import { enqueueSnackbar } from "notistack";

const PlaylistPage = () => {
  const router = useRouter();

  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.replace("/auth");
    }
  }, [initialized, user, router]);

  const [createRequest, { isLoading: createRequestIsLoading }] =
    useCreatePlaylistMutation();

  const {
    register: createForm,
    handleSubmit: createHandleSubmit,
    control,
    watch,
    setError: setEditPlaylistRequestError,
    formState: { errors: createPlaylistErrors, isDirty: createFormIsDirty },
  } = useForm<PlaylistCreateForm>({
    resolver: zodResolver(playlistCreateSchema),
    defaultValues: {
      name: "",
      isPublic: true,
      picture: undefined,
    },
  });

  const picture = watch("picture");

  const coverSrc = useMemo(() => {
    if (picture instanceof File) {
      return URL.createObjectURL(picture);
    }

    return null;
  }, [picture]);

  useEffect(() => {
    return () => {
      if (picture instanceof File) {
        URL.revokeObjectURL(coverSrc!);
      }
    };
  }, [coverSrc, picture]);

  async function handlerEditPlaylist(data: PlaylistCreateForm) {
    if (createFormIsDirty) {
      try {
        const formData = new FormData();
        formData.append("isPublic", String(data.isPublic));
        formData.append("name", data.name);
        if (data.picture) formData.append("picture", data.picture);

        const result = await createRequest(formData).unwrap();
        enqueueSnackbar("Плейлист успешно создан", { variant: "success" });
        router.push(`/playlists/${result?._id}`);
      } catch (error) {
        const apiError = parseApiError(error);

        if (apiError) {
          applyApiErrorToForm<PlaylistCreateForm>(
            apiError,
            setEditPlaylistRequestError,
          );
        }
      }
    }
  }

  return (
    <MainLayout>
      <h2 className="text-center font-black text-3xl py-10">
        Создание плейлиста
      </h2>
      <form
        onSubmit={createHandleSubmit(handlerEditPlaylist)}
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
          </div>

          <div className="my-auto flex flex-col gap-3">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField
                  placeholder="Введите название"
                  {...field}
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-end">
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <Button
                variant="outlined"
                startIcon={<Save />}
                type="submit"
                disabled={createRequestIsLoading}
              >
                Сохранить
              </Button>

              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  router.back();
                }}
              >
                Отменить
              </Button>
            </div>
            {createPlaylistErrors.root && (
              <p className="text-red-500 text-sm text-center">
                {createPlaylistErrors.root.message ||
                  "Произошла ошибка на сервере"}
              </p>
            )}
          </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default PlaylistPage;
