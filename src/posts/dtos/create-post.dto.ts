import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  postType: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  topic: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  chapter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  lesson?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  visibility?: string;
}