import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTrackCommentDto {
  @IsMongoId()
  trackId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;
}
