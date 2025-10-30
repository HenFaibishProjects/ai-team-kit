import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

export enum AssignmentRole {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
  REVIEWER = 'Reviewer',
}

@Entity('task_assignments')
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => Task, (task) => task.assignments)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AssignmentRole,
    default: AssignmentRole.PRIMARY,
  })
  role: AssignmentRole;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}
