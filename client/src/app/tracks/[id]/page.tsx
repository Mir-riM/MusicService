"use client";
import { Button, Card, TextField } from "@mui/material";
import MainLayout from "../../../layouts/MainLayout";
import { useParams } from "next/navigation";
import {
  useCreateCommentMutation,
  useGetTrackByIdQuery,
} from "../../../api/tracks";
import { useState } from "react";
import { IComment } from "../../../types/entries/track";

const TrackPage = () => {
  const params = useParams<{ id: string }>();

  const [username, setUsername] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  const { data: track, isLoading } = useGetTrackByIdQuery(params.id);
  const [useCreateComment, { isLoading: createCommentIsLoading, error }] =
    useCreateCommentMutation();

  async function createComment() {
    try {
      await useCreateComment({
        username,
        text: comment,
        trackId: params.id,
      }).unwrap();

      setComment("");
      setUsername("");
    } catch (error) {
      console.log("Ошибка при создании комментария: ", error);
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
              <div className="flex flex-col gap-5">
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  placeholder="Ваше имя"
                />
                <TextField
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  fullWidth
                  placeholder="Ваш комментарий"
                  multiline
                  rows={4}
                />
                <Button onClick={() => createComment()} className="w-full">
                  Отправить
                </Button>
              </div>

              {track?.comments !== undefined &&
                track.comments.map((comment: IComment) => (
                  <Card
                    className="p-5 flex flex-col gap-4 bg-zinc-800/80 border border-zinc-700/50"
                    key={comment._id}
                  >
                    <p className="font-medium text-zinc-200">{comment.username}</p>
                    <p className="text-sm text-zinc-400">{comment.text}</p>
                  </Card>
                ))}
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
