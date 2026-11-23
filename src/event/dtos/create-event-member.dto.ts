
import { IsUUID } from 'class-validator';

export class CreateEventMemberDto {
  @IsUUID()
  userId: string;
}
