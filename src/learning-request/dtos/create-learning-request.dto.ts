
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLearningRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  chapter: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  lesson: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  topic: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
