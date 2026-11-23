import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateReactionDto {
  @IsUUID()
  postId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  type: string;
}