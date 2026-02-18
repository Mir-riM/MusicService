"use client";
import { MusicNote } from "@mui/icons-material";
import { Card } from "@mui/material";
import { useRouter } from "next/navigation";
import { id } from "zod/v4/locales";

export type PlaylistCardProps = {
  id: string;
  name: string;
  pictureUrl?: string;
};

const PlaylistCard = ({ pictureUrl, name, id }: PlaylistCardProps) => {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/playlists/${id}`)}
      className="w-full max-w-60 p-5 rounded-4xl shadow cursor-pointer"
    >
      <div className="w-full h-dvh max-w-50 max-h-50">
        {pictureUrl ? (
          <img
            className="object-cover w-full h-full"
            src={`${process.env.NEXT_PUBLIC_MINIO_URL}/${pictureUrl}`}
            alt={`Обложка плейлиста ${name}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex justify-center items-center">
            <MusicNote color="primary" fontSize="large" />
          </div>
        )}
      </div>
      <h6 className="font-semibold mt-5 text-xl text-center">{name}</h6>
    </Card>
  );
};

export default PlaylistCard;
