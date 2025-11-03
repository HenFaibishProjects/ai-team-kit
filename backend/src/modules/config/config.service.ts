import { Injectable, NotFoundException } from '@nestjs/common';
import type { TeamConfig } from '../../shared/types';

// In-memory storage for no-auth mode
export interface StoredProject {
  id: string;
  userId: string;
  projectName: string;
  teamConfig: TeamConfig;
  sprintPlan?: string;
  raciChart?: string;
  adrDocument?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ConfigService {
  private projects: Map<string, StoredProject> = new Map();
  private projectCounter = 1;

  constructor() {}

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
  ): Promise<StoredProject> {
    const id = `project-${this.projectCounter++}`;
    const now = new Date();
    
    const project: StoredProject = {
      id,
      userId,
      projectName: teamConfig.projectName,
      teamConfig,
      sprintPlan: additionalData?.sprintPlan,
      raciChart: additionalData?.raciChart,
      adrDocument: additionalData?.adrDocument,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(id, project);
    return project;
  }

  /**
   * Retrieve a project by ID
   * @param projectId - The project ID
   * @returns The project or null if not found
   */
  async getConfig(projectId: string): Promise<StoredProject | null> {
    return this.projects.get(projectId) || null;
  }

  /**
   * Get all projects for a specific user
   * @param userId - The user ID
   * @returns Array of projects
   */
  async getUserProjects(userId: string): Promise<StoredProject[]> {
    const userProjects: StoredProject[] = [];
    for (const project of this.projects.values()) {
      if (project.userId === userId) {
        userProjects.push(project);
      }
    }
    // Sort by updatedAt descending
    return userProjects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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
  ): Promise<StoredProject> {
    const project = this.projects.get(projectId);

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or unauthorized');
    }

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };

    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }

  /**
   * Delete a project
   * @param projectId - The project ID to delete
   * @param userId - The user ID (for authorization)
   * @returns True if deleted, false if not found
   */
  async deleteConfig(projectId: string, userId: string): Promise<boolean> {
    const project = this.projects.get(projectId);
    
    if (!project || project.userId !== userId) {
      return false;
    }

    return this.projects.delete(projectId);
  }

  /**
   * Get all project IDs for a user
   * @param userId - The user ID
   * @returns Array of project IDs
   */
  async getAllConfigIds(userId: string): Promise<string[]> {
    const ids: string[] = [];
    for (const project of this.projects.values()) {
      if (project.userId === userId) {
        ids.push(project.id);
      }
    }
    return ids;
  }
}
