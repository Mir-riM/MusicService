"use client";

import { Pause, PlayArrow, VolumeMute, VolumeUp } from "@mui/icons-material";
import { Card } from "@mui/material";
import { useEffect, useState } from "react";
import TrackProgress from "./track-progress";
import {
  pauseTrack,
  playTrack,
  setCurrentTimeTrack,
  setDurationTrack,
  setVolumeTrack,
} from "../../store/slices/player";
import { useAppDispatch, useAppSelector } from "../../hooks/store";

let track: HTMLAudioElement | null = null;

const Player: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    active,
    pause: isPaused,
    volume,
    duration,
    currentTime,
  } = useAppSelector((state) => state.player);

  useEffect(() => {
    if (!active) {
      track = new Audio();
    } else {
      // при запуске нового трека выставляем настройки на базовые
      // начинаем песню с начала, выставляем громкость
      if (track) {
        track.src = `${process.env.NEXT_PUBLIC_MINIO_URL}/${active.trackUrl}`;
        track.volume = volume / 100;
        track.onloadedmetadata = () => {
          dispatch(setDurationTrack(Math.ceil(track!.duration)));
        };
        track.ontimeupdate = () => {
          dispatch(setCurrentTimeTrack(Math.ceil(track!.currentTime)));
        };

        // включаем трек
        track.play();
      }
    }
  }, [active]);

  // отдельный useEffect для паузы и возобновления трека
  // если isPaused изменился даже в другом месте
  // например кнопка паузы в TrackItem
  useEffect(() => {
    if (isPaused) {
      track?.pause();
    } else if (!isPaused) {
      track?.play();
    }
  }, [isPaused]);

  // todo: потом сделать проверку есть ли следующий трек, если есть - переключать на него
  useEffect(() => {
    if (currentTime === duration || currentTime > duration) {
      dispatch(pauseTrack());
      dispatch(setCurrentTimeTrack(0));
      track?.pause();
      track!.currentTime = 0;
    }
  }, [currentTime, duration]);

  function trackStatusToggle() {
    if (isPaused && duration === currentTime) {
      dispatch(playTrack());
      track?.play();
    } else if (isPaused) {
      dispatch(playTrack());
      track?.play();
    } else {
      dispatch(pauseTrack());
      track?.pause();
    }
  }

  function setTrackVolume(vol: number) {
    if (track) {
      dispatch(setVolumeTrack(vol));
      track.volume = vol / 100;
    }
  }

  function setTrackCurrentTime(time: number) {
    if (track) {
      dispatch(setCurrentTimeTrack(time));
      track.currentTime = time;
    }
  }

  if (!active) {
    return null;
  }

  return (
    <Card className="fixed bottom-0 w-full grid grid-cols-3 grid-rows-1 justify-between items-center p-4 rounded-none border-t border-zinc-700/50">
      <div className="flex items-center gap-5">
        <img
          className="object-cover size-16"
          src={`${process.env.NEXT_PUBLIC_MINIO_URL}/${active?.pictureUrl}`}
          alt="Обложка трека"
        />
        <div className="text-zinc-100">
          <p className="font-medium">{active?.name}</p>
          <p className="text-sm text-zinc-400">{active?.author}</p>
        </div>
      </div>
      <div className="m-auto w-fit flex flex-col items-center">
        <div onClick={() => trackStatusToggle()}>
          {isPaused ? <PlayArrow /> : <Pause />}
        </div>
        <TrackProgress
          left={currentTime}
          right={duration}
          minutesSeconds={true}
          onChange={(e) => setTrackCurrentTime(Number(e.target.value))}
        />
      </div>
      <div className="ml-auto w-fit flex">
        {volume !== 0 ? <VolumeUp /> : <VolumeMute />}
        <TrackProgress
          left={volume}
          right={100}
          onChange={(e) => setTrackVolume(Number(e.target.value))}
        />
      </div>
    </Card>
  );
};

export default Player;
