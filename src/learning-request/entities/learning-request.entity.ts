
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { LearningRequestStatus } from '../enums/learning-request-status.enum';

@Entity({ name: 'learning_requests' })
export class LearningRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  chapter: string;

  @Column({ type: 'varchar', length: 150 })
  lesson: string;

  @Column({ type: 'varchar', length: 150 })
  topic: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: LearningRequestStatus,
    default: LearningRequestStatus.PENDING,
  })
  status: LearningRequestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.learningRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
