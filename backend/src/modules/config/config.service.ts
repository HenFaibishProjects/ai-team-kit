import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import type { TeamConfig } from '../../shared/types';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Save a team configuration for a user
   * @param userId - The user ID
   * @param teamConfig - The team configuration to save
   * @param additionalData - Optional sprint, RACI, and ADR data
   * @returns The saved project
   */
  async saveConfig(
    userId: string,
    teamConfig: TeamConfig,
    additionalData?: {
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
    },
  ): Promise<Project> {
    // Ensure user exists (in production, this would be validated by auth middleware)
    let user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      // For now, create a temporary user if not exists
      // In production, this would be handled by your auth system
      user = this.userRepository.create({
        id: userId,
        email: `user-${userId}@temp.com`,
        username: `user-${userId}`,
      });
      await this.userRepository.save(user);
    }

    const project = this.projectRepository.create({
      userId,
      projectName: teamConfig.projectName,
      teamConfig,
      sprintPlan: additionalData?.sprintPlan ?? null,
      raciChart: additionalData?.raciChart ?? null,
      adrDocument: additionalData?.adrDocument ?? null,
    });

    return await this.projectRepository.save(project);
  }

  /**
   * Retrieve a project by ID
   * @param projectId - The project ID
   * @returns The project or null if not found
   */
  async getConfig(projectId: string): Promise<Project | null> {
    return await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['user'],
    });
  }

  /**
   * Get all projects for a specific user
   * @param userId - The user ID
   * @returns Array of projects
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Update an existing project
   * @param projectId - The project ID
   * @param userId - The user ID (for authorization)
   * @param updates - Partial project updates
   * @returns The updated project
   */
  async updateConfig(
    projectId: string,
    userId: string,
    updates: Partial<{
      teamConfig: TeamConfig;
      sprintPlan: string;
      raciChart: string;
      adrDocument: string;
      status: string;
    }>,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found or unauthorized');
    }

    Object.assign(project, updates);
    return await this.projectRepository.save(project);
  }

  /**
   * Delete a project
   * @param projectId - The project ID to delete
   * @param userId - The user ID (for authorization)
   * @returns True if deleted, false if not found
   */
  async deleteConfig(projectId: string, userId: string): Promise<boolean> {
    const result = await this.projectRepository.delete({
      id: projectId,
      userId,
    });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get all project IDs for a user
   * @param userId - The user ID
   * @returns Array of project IDs
   */
  async getAllConfigIds(userId: string): Promise<string[]> {
    const projects = await this.projectRepository.find({
      where: { userId },
      select: ['id'],
    });
    return projects.map((p) => p.id);
  }
}
