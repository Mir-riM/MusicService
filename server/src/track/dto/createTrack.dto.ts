import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class createTrackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  author: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  text?: string;
}