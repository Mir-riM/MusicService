export interface ITrack {
  _id: string;
  name: string;
  author: string;
  text: string;
  listenings: number;
  trackUrl: string;
  pictureUrl: string;
  comments?: IComment[];
}

export interface IComment {
  _id: string;
  username: string;
  text: string;
}

export interface ITrackLike {
  _id: string;
  userId: string;
  trackId: string;
}
