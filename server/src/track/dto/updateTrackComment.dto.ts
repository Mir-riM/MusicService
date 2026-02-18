import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTrackCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;
}
