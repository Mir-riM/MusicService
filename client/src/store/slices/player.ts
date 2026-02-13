import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITrack } from "../../types/entries/track";

type SetActiveTrack = {
  trackKey: number;
  queue: ITrack[];
};

type PlayerState = {
  queue: ITrack[] | null;
  shuffle: ITrack | null;
  active: number | null;
  repeatMode: "one" | "all" | "off";
  volume: number;
  duration: number;
  currentTime: number;
  pause: boolean;
};

const initialState: PlayerState = {
  queue: null,
  shuffle: null,
  repeatMode: "off",
  active: null,
  volume: 10,
  duration: 0,
  currentTime: 0,
  pause: true,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playTrack(state) {
      state.pause = false;
    },
    pauseTrack(state) {
      state.pause = true;
    },
    setActiveTrack(state, action: PayloadAction<SetActiveTrack>) {
      state.active = action.payload.trackKey;
      state.queue = action.payload.queue;
      state.duration = 0;
      state.currentTime = 0;
    },
    setDurationTrack(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setCurrentTimeTrack(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setVolumeTrack(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    toggleRepeatMode(state) {
      console.log(state.repeatMode);

      if (state.repeatMode === "off") {
        state.repeatMode = "all";
      } else if (state.repeatMode === "all") {
        state.repeatMode = "one";
      } else if (state.repeatMode === "one") {
        state.repeatMode = "off";
      }
    },
    nextTrack(state) {
      if (state.active === state.queue!.length - 1) {
        state.active = 0;
      } else {
        state.active! += 1;
      }
    },
    previousTrack(state) {
      if (state.active === 0) {
        state.active = state.queue!.length - 1;
      } else {
        state.active! -= 1;
      }
    },
  },
});

export const {
  playTrack,
  pauseTrack,
  setActiveTrack,
  setDurationTrack,
  setCurrentTimeTrack,
  setVolumeTrack,
  toggleRepeatMode,
  nextTrack,
  previousTrack,
} = playerSlice.actions;

export default playerSlice.reducer;
