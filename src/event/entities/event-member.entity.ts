
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';
import { EventMemberStatus } from '../enums/event-member-status.enum';

@Entity({ name: 'event_members' })
export class EventMember {
  @PrimaryColumn({ type: 'uuid' })
  eventId: string;

  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: EventMemberStatus,
    default: EventMemberStatus.INVITED,
  })
  status: EventMemberStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  joinedAt: Date;

  // Relationship with Event
  @ManyToOne(() => Event, (event) => event.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  // Relationship with User
  @ManyToOne(() => User, (user) => user.eventMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
