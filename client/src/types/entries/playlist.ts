import { ITrack } from "./track";

export enum PlaylistType {
  SYSTEM = "system",
  FORK = "fork",
  USER = "user",
}

export interface IPlaylist {
  _id: string;
  name: string;
  type: PlaylistType;
  ownerId: string;
  originalPlaylistId?: string;
  pictureUrl: string;
  isPublic: boolean;
}

export interface IPlaylistWithTracks extends IPlaylist {
  tracks: {
    playlistId: string;
    trackId: string;
    position: number;
    addedAt: string;
    track: ITrack;
  }[];
}

export interface IPlaylistTrackLink {
  _id: string;
  playlistId: string;
  trackId: string;
  position: number;
  addedAt: string;
}

export interface IPlaylistWithTrackLinks {
  _id: string;
  name: string;
  tracks: IPlaylistTrackLink[];
}
