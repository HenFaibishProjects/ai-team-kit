import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

export enum TeamMemberRole {
  DEVELOPER = 'Developer',
  DESIGNER = 'Designer',
  QA = 'QA',
  DEVOPS = 'DevOps',
  MANAGER = 'Manager',
  PRODUCT_OWNER = 'Product Owner',
  SCRUM_MASTER = 'Scrum Master',
  ARCHITECT = 'Architect',
  OTHER = 'Other',
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.members)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.DEVELOPER,
  })
  role: TeamMemberRole;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
