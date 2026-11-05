
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { DrawProjectStatus } from '../enums/draw-project-status.enum';

@Entity({ name: 'draw_projects' })
export class DrawProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb' })
  canvasData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  previewUrl: string | null;

  @Column({
    type: 'enum',
    enum: DrawProjectStatus,
    default: DrawProjectStatus.DRAFT,
  })
  status: DrawProjectStatus;

  @Column({ type: 'uuid', nullable: true, unique: true })
  postId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.drawProjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Post, (post) => post.drawProject, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'postId' })
  post: Post | null;
}
