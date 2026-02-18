import { IsMongoId } from 'class-validator';

export class ToggleTrackInPlaylistDto {
  @IsMongoId()
  playlistId: string;

  @IsMongoId()
  trackId: string;
}
