import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  intendedUse: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiry: Date | null;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
