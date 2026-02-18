import { IsMongoId } from 'class-validator';

export class forkDto {
  @IsMongoId()
  playlistId: string;
}
