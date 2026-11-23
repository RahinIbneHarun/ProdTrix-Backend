import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePostMediaDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  mediaType: string;

  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}