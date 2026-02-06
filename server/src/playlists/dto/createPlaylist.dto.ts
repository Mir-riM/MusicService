import { PlaylistType } from '../schemas/playlist.schema';

export class CreatePlaylistDto {
  name: string;
  isPublic: boolean;
  type: PlaylistType;
  ownerId: string;
  originalPlaylistId?: string;
  pictureUrl: string;
}
