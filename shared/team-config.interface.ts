import { FeatureConfig } from './feature-config.interface';

export interface TeamConfig {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
  features: FeatureConfig[];
}

export interface TeamMember {
  id: string;
  email: string;
  role: TeamRole;
  joinedAt: Date;
}

export enum TeamRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}
