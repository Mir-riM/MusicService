import { IsMongoId } from 'class-validator';

export class SubscribeOnPlaylistDto {
  @IsMongoId()
  playlistId: string;
}
