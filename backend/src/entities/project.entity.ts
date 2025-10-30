import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Team } from './team.entity';
import { Sprint } from './sprint.entity';
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

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.projects)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'team_id', nullable: true })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.projects)
  @JoinColumn({ name: 'team_id' })
  team: Team;

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

  @OneToMany(() => Sprint, (sprint) => sprint.project)
  sprints: Sprint[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
