import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import type { TeamConfig } from '../shared/types';
import { ProjectStatus } from './project-status.enum';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  projectName: string;

  @Column('jsonb')
  teamConfig: TeamConfig;

  @Column({ type: 'text', nullable: true })
  sprintPlan: string;

  @Column({ type: 'text', nullable: true })
  raciChart: string;

  @Column({ type: 'text', nullable: true })
  adrDocument: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status: ProjectStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
