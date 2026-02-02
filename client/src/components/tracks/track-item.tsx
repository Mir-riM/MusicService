import { Card, Grid } from "@mui/material";
import { ITrack } from "../../types/entries/track";
import { Pause, PlayArrow } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  pauseTrack,
  playTrack,
  setActiveTrack,
} from "../../store/slices/player";
import { useAppDispatch, useAppSelector } from "../../hooks/store";

interface TrackItemProps {
  track: ITrack;
  active?: boolean;
}

const TrackItem = ({ track }: TrackItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { active, pause: isPaused } = useAppSelector((state) => state.player);

  function togglePlayStatus(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (active?._id === track._id && !isPaused) {
      dispatch(pauseTrack());
    } else if (active?._id === track._id && isPaused) {
      dispatch(playTrack());
    } else {
      dispatch(setActiveTrack(track));
      dispatch(playTrack());
    }
  }

  return (
    <Card
      onClick={() => router.push(`/tracks/${track._id}`)}
      className="w-full grid grid-cols-3 grid-rows-1 justify-between items-center p-4 cursor-pointer hover:bg-zinc-800/80 transition-colors"
    >
      <div className="flex items-center gap-5">
        <img
          className="object-cover size-16 rounded"
          src={`${process.env.NEXT_PUBLIC_MINIO_URL}/${track?.pictureUrl}`}
          alt="Обложка трека"
        />
        <div>
          <p className="font-medium text-zinc-100">{track?.name}</p>
          <p className="text-sm text-zinc-400">{track?.author}</p>
        </div>
      </div>
      <div className="m-auto w-fit" onClick={(e) => togglePlayStatus(e)}>
        {active?._id === track._id && !isPaused ? <Pause /> : <PlayArrow />}
      </div>
    </Card>
  );
};

export default TrackItem;
