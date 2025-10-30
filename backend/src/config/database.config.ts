import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { Organization } from '../entities/organization.entity';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Sprint } from '../entities/sprint.entity';
import { Task } from '../entities/task.entity';
import { TaskAssignment } from '../entities/task-assignment.entity';
import { TaskComment } from '../entities/task-comment.entity';
import { Notification } from '../entities/notification.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai_team_kit',
  entities: [
    User,
    Project,
    Organization,
    Team,
    TeamMember,
    Sprint,
    Task,
    TaskAssignment,
    TaskComment,
    Notification,
  ],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync schema in development
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
