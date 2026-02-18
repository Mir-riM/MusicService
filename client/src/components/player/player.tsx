"use client";

import { Pause, PlayArrow, VolumeMute, VolumeUp } from "@mui/icons-material";
import { Card, IconButton } from "@mui/material";
import { useEffect, useRef } from "react";
import TrackProgress from "./trackProgress";
import {
  nextTrack,
  pauseTrack,
  playTrack,
  previousTrack,
  setActiveTrack,
  setCurrentTimeTrack,
  setDurationTrack,
  setVolumeTrack,
  toggleRepeatMode,
} from "../../store/slices/player";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RepeatIcon from "@mui/icons-material/Repeat";
import RepeatOnIcon from "@mui/icons-material/RepeatOn";
import RepeatOneOnIcon from "@mui/icons-material/RepeatOneOn";
import { useListenTrackMutation } from "../../api/tracks";

const Player: React.FC = () => {
  const dispatch = useAppDispatch();
  const [listenTrackRequest] = useListenTrackMutation();
  const {
    queue,
    shuffle,
    repeatMode,
    active,
    pause: isPaused,
    volume,
    duration,
    currentTime,
  } = useAppSelector((state) => state.player);

  // Создаем элемент аудио
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenedTrackIdRef = useRef<string | null>(null);
  const listenedSecondsRef = useRef(0);
  const lastPlaybackTimeRef = useRef(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    // при запуске нового трека выставляем настройки на базовые
    // начинаем песню с начала, выставляем громкость
    if (queue && audioRef.current) {
      const activeTrack = queue[active!];
      if (!activeTrack) return;

      listenedTrackIdRef.current = null;
      listenedSecondsRef.current = 0;
      lastPlaybackTimeRef.current = 0;

      // останавливаем трек для защиты от гонок
      audioRef.current.pause();
      audioRef.current.src = `${process.env.NEXT_PUBLIC_MINIO_URL}/${activeTrack.trackUrl}`;
      audioRef.current.volume = volume / 100;
      audioRef.current.onloadedmetadata = () => {
        const audio = audioRef.current;
        if (!audio) return;
        lastPlaybackTimeRef.current = audio.currentTime;
        dispatch(setDurationTrack(Math.ceil(audioRef.current!.duration)));
      };
      audioRef.current.ontimeupdate = () => {
        const audio = audioRef.current;
        if (!audio) return;

        dispatch(setCurrentTimeTrack(Math.ceil(audio.currentTime)));

        if (listenedTrackIdRef.current === activeTrack._id) return;
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

        const delta = audio.currentTime - lastPlaybackTimeRef.current;
        lastPlaybackTimeRef.current = audio.currentTime;

        // Учитываем только непрерывное проигрывание, а не скачки от перемотки.
        if (!audio.paused && delta > 0 && delta <= 1.5) {
          listenedSecondsRef.current += delta;
        }

        const listenedHalf = listenedSecondsRef.current >= audio.duration / 2;
        if (listenedHalf) {
          listenedTrackIdRef.current = activeTrack._id;
          listenTrackRequest(activeTrack._id);
        }
      };

      // включаем трек
      audioRef.current.play();
    } else {
      audioRef.current = new Audio();
    }
  }, [active, queue, audioRef.current, listenTrackRequest]);

  // отдельный useEffect для паузы и возобновления трека
  // если isPaused изменился даже в другом месте
  // например кнопка паузы в TrackItem
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPaused) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPaused]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (!queue || active == null) return;

      if (repeatMode === "one") {
        dispatch(setCurrentTimeTrack(0));
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === "all") {
        dispatch(nextTrack());
      } else if (repeatMode === "off") {
        if (active === queue.length - 1) {
          dispatch(pauseTrack());
          return;
        }
        dispatch(nextTrack());
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [repeatMode, active, queue]);

  // ************************************************************************

  function trackStatusToggle() {
    if (isPaused) {
      dispatch(playTrack());
      audioRef.current?.play();
    } else {
      dispatch(pauseTrack());
      audioRef.current?.pause();
    }
  }

  function setTrackVolume(vol: number) {
    if (audioRef.current) {
      dispatch(setVolumeTrack(vol));
      audioRef.current.volume = vol / 100;
    }
  }

  function setTrackCurrentTime(time: number) {
    if (audioRef.current) {
      dispatch(setCurrentTimeTrack(time));
      audioRef.current.currentTime = time;
    }
  }

  function changeActiveTrack(type: "next" | "previous"): void {
    if (isPaused) {
      dispatch(playTrack());
    }

    if (type == "next") {
      dispatch(nextTrack());
    }

    if (type == "previous") {
      dispatch(previousTrack());
    }
  }

  if (!queue) {
    return;
  }

  return (
    <Card className="fixed bottom-0 w-full grid grid-cols-3 grid-rows-1 justify-between items-center p-4 rounded-none border-t border-zinc-700/50">
      <div className="flex items-center gap-5">
        <img
          className="object-cover size-16"
          src={`${process.env.NEXT_PUBLIC_MINIO_URL}/${queue[active!]?.pictureUrl}`}
          alt="Обложка трека"
        />
        <div className="text-zinc-100">
          <p className="font-medium">{queue[active!]?.name}</p>
          <p className="text-sm text-zinc-400">{queue[active!]?.author}</p>
        </div>
      </div>
      <div className="m-auto w-fit flex flex-col items-center">
        <div className="flex justify-center gap-5">
          <IconButton onClick={() => changeActiveTrack("previous")}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton onClick={() => trackStatusToggle()}>
            {isPaused ? <PlayArrow /> : <Pause />}
          </IconButton>
          <IconButton onClick={() => changeActiveTrack("next")}>
            <SkipNextIcon />
          </IconButton>
        </div>
        <TrackProgress
          left={currentTime}
          right={duration}
          minutesSeconds={true}
          onChange={(e) => setTrackCurrentTime(Number(e.target.value))}
        />
      </div>
      <div className="ml-auto w-fit flex gap-5">
        <IconButton
          onClick={() => {
            dispatch(toggleRepeatMode());
          }}
        >
          {repeatMode === "off" && <RepeatIcon />}
          {repeatMode === "all" && <RepeatOnIcon />}
          {repeatMode === "one" && <RepeatOneOnIcon />}
        </IconButton>
        <div className="flex gap-2 items-center">
          {volume !== 0 ? <VolumeUp /> : <VolumeMute />}
          <TrackProgress
            left={volume}
            right={100}
            onChange={(e) => setTrackVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </Card>
  );
};

export default Player;
