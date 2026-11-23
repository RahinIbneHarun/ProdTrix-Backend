//This DTO allows the owner or Super Admin to link a project to an existing post.
import { IsUUID } from 'class-validator';

export class LinkDrawProjectPostDto {
  @IsUUID()
  postId: string;
}
