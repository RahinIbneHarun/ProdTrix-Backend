
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Profile } from './profile.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { OneToMany } from 'typeorm';
import { Follow } from '../../follows/entities/follow.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from 'src/reactions/entities/reaction.entity';
import { LearningRequest } from 'src/learning-request/entities/learning-request.entity';
import { DrawProject } from 'src/draw-project/entities/draw-project.entity';
import { EventMember } from 'src/event/entities/event-member.entity';
import { Event } from 'src/event/entities/event.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSUMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  emailVerifiedAt: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => LearningRequest, (learningRequest) => learningRequest.user)
  learningRequests: LearningRequest[];

  @OneToMany(() => DrawProject, (project) => project.user)
  drawProjects: DrawProject[];

  @OneToMany(() => EventMember, (eventMember) => eventMember.user)
  eventMemberships: EventMember[];

  @OneToMany(() => Event, (event) => event.creator)
  createdEvents: Event[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(
    () => Advertisement,
    (advertisement) => advertisement.user,
  )
  advertisements: Advertisement[];

  @OneToMany(
    () => ActivityLog,
    (activityLog) => activityLog.user,
  )
  activityLogs: ActivityLog[];
}

