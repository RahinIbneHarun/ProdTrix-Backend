import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(
  OmitType(CreateCommentDto, ['postId', 'parentCommentId'] as const),
) {}

//This allows users to update only the comment content. They cannot move an existing comment to another post or change its parent through this endpoint.