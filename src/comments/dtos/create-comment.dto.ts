import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}