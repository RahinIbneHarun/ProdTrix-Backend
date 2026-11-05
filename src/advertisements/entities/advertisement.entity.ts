
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity({ name: 'advertisements' })
export class Advertisement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  postId: string | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  budgetAmount: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  @Column({ type: 'smallint', nullable: true })
  targetAgeMin: number | null;

  @Column({ type: 'smallint', nullable: true })
  targetAgeMax: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  targetGender: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetAction: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Advertisement creator
  @ManyToOne(() => User, (user) => user.advertisements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Related post (optional)
  @ManyToOne(() => Post, (post) => post.advertisements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'postId' })
  post: Post | null;

  @OneToMany(
    () => Payment,
    (payment) => payment.advertisement,
    )
  payments: Payment[];
}
