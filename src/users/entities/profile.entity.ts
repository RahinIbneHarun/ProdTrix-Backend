
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Sex } from '../enums/sex.enum';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'text', nullable: true })
  coverUrl: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  timezone: string | null;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({
    type: 'enum',
    enum: Sex,
    nullable: true,
    })
    sex: Sex | null;

  @Column({ type: 'varchar', nullable: true })
  homeLocation: string | null;

  @Column({ type: 'varchar', nullable: true })
  currentLocation: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;
}
