"use client";
import { Button, Card, IconButton, TextField } from "@mui/material";
import { DeleteOutline, EditOutlined, SaveOutlined, CloseOutlined } from "@mui/icons-material";
import MainLayout from "../../../layouts/MainLayout";
import { useParams } from "next/navigation";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetTrackByIdQuery,
  useUpdateCommentMutation,
} from "../../../api/tracks";
import { useEffect, useMemo, useState } from "react";
import { IComment } from "../../../types/entries/track";
import { useAppSelector } from "../../../hooks/store";
import { parseApiError } from "../../../shared/errors/parse-api-error";
import { enqueueSnackbar } from "notistack";

const TrackPage = () => {
  const params = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [commentText, setCommentText] = useState<string>("");
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [isEditingOwnComment, setIsEditingOwnComment] = useState<boolean>(false);

  const { data: track, isLoading } = useGetTrackByIdQuery(params.id);
  const [createCommentRequest, { isLoading: createCommentIsLoading }] =
    useCreateCommentMutation();
  const [updateCommentRequest, { isLoading: updateCommentIsLoading }] =
    useUpdateCommentMutation();
  const [deleteCommentRequest, { isLoading: deleteCommentIsLoading }] =
    useDeleteCommentMutation();

  const ownComment = useMemo(
    () => track?.comments?.find((comment) => comment.userId === user?._id),
    [track?.comments, user?._id],
  );
  const sortedComments = useMemo(() => {
    if (!track?.comments) return [];
    if (!ownComment) return track.comments;

    return [
      ownComment,
      ...track.comments.filter((comment) => comment._id !== ownComment._id),
    ];
  }, [track?.comments, ownComment]);

  useEffect(() => {
    setEditCommentText(ownComment?.text ?? "");
    if (!ownComment) {
      setIsEditingOwnComment(false);
    }
  }, [ownComment?.text]);

  async function createComment() {
    try {
      await createCommentRequest({
        text: commentText,
        trackId: params.id,
      }).unwrap();

      setCommentText("");
    } catch (error) {
      const apiError = parseApiError(error);
      enqueueSnackbar(
        `Произошла ошибка: ${apiError?.message || "Неизвестная ошибка"}`,
        {
          variant: "error",
        },
      );
    }
  }

  async function updateComment() {
    if (!ownComment) return;

    try {
      await updateCommentRequest({
        commentId: ownComment._id,
        text: editCommentText,
      }).unwrap();
    } catch (error) {
      const apiError = parseApiError(error);
      enqueueSnackbar(
        `Произошла ошибка: ${apiError?.message || "Неизвестная ошибка"}`,
        {
          variant: "error",
        },
      );
    }
  }

  async function deleteComment() {
    if (!ownComment) return;

    try {
      await deleteCommentRequest({
        commentId: ownComment._id,
      }).unwrap();
      setEditCommentText("");
      setIsEditingOwnComment(false);
    } catch (error) {
      const apiError = parseApiError(error);
      enqueueSnackbar(
        `Произошла ошибка: ${apiError?.message || "Неизвестная ошибка"}`,
        {
          variant: "error",
        },
      );
    }
  }

  return (
    <MainLayout>
      {isLoading ? (
        <div className="text-zinc-400">Загрузка...</div>
      ) : track ? (
        <div className="grid sm:grid-cols-3 gap-5 pb-40">
          <div className="flex flex-col w-full justify-start items-start col-start-1 col-end-3">
            <img
              className="object-cover w-full sm:size-100 rounded-lg"
              src={`${process.env.NEXT_PUBLIC_MINIO_URL}/${track.pictureUrl}`}
              alt="Обложка трека"
            />
            <p className="mt-5 text-xl font-medium text-zinc-100">{track.name}</p>
            <p className="text-zinc-400">{track.author}</p>
            <p className="text-sm text-zinc-500">Прослушиваний: {track.listenings}</p>

            <div className="flex flex-col gap-5 w-full mt-10">
              <h2 className="text-lg font-semibold text-zinc-100">Комментарии</h2>

              {user ? (
                <div className="flex flex-col gap-4">
                  {!ownComment ? (
                    <>
                      <TextField
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        fullWidth
                        placeholder="Ваш комментарий"
                        multiline
                        rows={4}
                      />
                      <Button
                        onClick={() => createComment()}
                        className="w-full"
                        disabled={createCommentIsLoading || !commentText.trim()}
                      >
                        Отправить
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      Вы уже оставили комментарий. Он закреплен первым в списке.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">
                  Чтобы оставить комментарий, войдите в аккаунт.
                </p>
              )}

              {sortedComments.map((comment: IComment) => {
                const isOwnComment = comment.userId === user?._id;
                return (
                  <Card
                    className={`p-5 flex flex-col gap-4 bg-zinc-800/80 border ${
                      isOwnComment ? "border-white/60" : "border-zinc-700/50"
                    }`}
                    key={comment._id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-200">{comment.username}</p>
                        {isOwnComment && (
                          <span className="text-xs text-zinc-100 border border-white/50 rounded px-2 py-0.5">
                            Ваш комментарий
                          </span>
                        )}
                      </div>

                      {isOwnComment && (
                        <div className="flex items-center">
                          {isEditingOwnComment ? (
                            <>
                              <IconButton
                                onClick={() => updateComment()}
                                disabled={
                                  updateCommentIsLoading || !editCommentText.trim()
                                }
                                size="small"
                                color="primary"
                              >
                                <SaveOutlined fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => {
                                  setEditCommentText(ownComment?.text ?? "");
                                  setIsEditingOwnComment(false);
                                }}
                                size="small"
                              >
                                <CloseOutlined fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <IconButton
                              onClick={() => setIsEditingOwnComment(true)}
                              size="small"
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          )}

                          <IconButton
                            onClick={() => deleteComment()}
                            disabled={deleteCommentIsLoading}
                            size="small"
                            color="error"
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </div>
                      )}
                    </div>

                    {isOwnComment && isEditingOwnComment ? (
                      <TextField
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-zinc-400">{comment.text}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
          {track?.text && (
            <div className="text-zinc-400 text-sm whitespace-pre-line">
              {track.text.replace(/\\n/g, "\n")}
            </div>
          )}
        </div>
      ) : (
        <div className="text-zinc-400">Трек не найден</div>
      )}
    </MainLayout>
  );
};

export default TrackPage;
