import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EditPlaylistDto {
  @IsMongoId()
  playlistId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return value;
    return value === true || value === 'true';
  })
  @IsBoolean()
  isPublic?: boolean;
}
