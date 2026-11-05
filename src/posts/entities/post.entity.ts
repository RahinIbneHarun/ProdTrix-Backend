
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from 'src/reactions/entities/reaction.entity';
import { PostMedia } from 'src/post-media/entities/post-media.entity';
import { DrawProject } from 'src/draw-project/entities/draw-project.entity';
import { Advertisement } from 'src/advertisements/entities/advertisement.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 30 })
  postType: string;

  @Column({ type: 'varchar', length: 150 })
  topic: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  chapter: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  lesson: string | null;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', length: 20, default: 'public' })
  visibility: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions: Reaction[];

  @OneToMany(() => PostMedia, (media) => media.post)
  media: PostMedia[];

  @OneToOne(() => DrawProject, (project) => project.post)
  drawProject: DrawProject | null;

  @OneToMany(
    () => Advertisement,
    (advertisement) => advertisement.post,
  )
  advertisements: Advertisement[];
}
