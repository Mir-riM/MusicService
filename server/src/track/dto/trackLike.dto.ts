import { IsMongoId } from 'class-validator';

export class TrackLikeDto {
  @IsMongoId()
  trackId: string;
}
