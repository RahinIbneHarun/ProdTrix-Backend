
import { IsEnum } from 'class-validator';
import { EventMemberStatus } from '../enums/event-member-status.enum';

export class UpdateEventMemberStatusDto {
  @IsEnum(EventMemberStatus)
  status: EventMemberStatus;
}
