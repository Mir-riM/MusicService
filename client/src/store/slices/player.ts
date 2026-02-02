import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITrack } from "../../types/entries/track";

type PlayerState = {
  active: ITrack | null;
  volume: number;
  duration: number;
  currentTime: number;
  pause: boolean;
};

const initialState: PlayerState = {
  active: null,
  volume: 25,
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
    setActiveTrack(state, action: PayloadAction<ITrack>) {
      state.active = action.payload;
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
  },
});

export const {
  playTrack,
  pauseTrack,
  setActiveTrack,
  setDurationTrack,
  setCurrentTimeTrack,
  setVolumeTrack,
} = playerSlice.actions;

export default playerSlice.reducer;
