import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import type { TeamConfig } from '../../shared/types';
import { Project } from '../../entities/project.entity';
import { ProjectStatus } from '../../entities/project-status.enum';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Save a new configuration
   */
  @Post('save')
  async saveConfig(
    @Body()
    body: {
      teamConfig: TeamConfig;
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
      userId?: string;
    },
  ): Promise<{ id: string; project: Project }> {
    try {
      // Use provided userId or default to 'default-user' for single-user mode
      const userId = body.userId || 'default-user';

      console.log('Received save config request:', {
        hasTeamConfig: !!body.teamConfig,
        userId,
        projectName: body.teamConfig?.projectName,
      });

      const project = await this.configService.saveConfig(
        userId,
        body.teamConfig,
        {
          sprintPlan: body.sprintPlan,
          raciChart: body.raciChart,
          adrDocument: body.adrDocument,
        },
      );

      console.log(
        'Project saved with ID:',
        project.id,
        'for userId:',
        project.userId,
      );

      return { id: project.id, project };
    } catch (error) {
      console.error('Error saving config:', error);
      throw new HttpException(
        'Failed to save configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific project by ID
   */
  @Get(':id')
  async getConfig(@Param('id') id: string): Promise<Project> {
    try {
      const config = await this.configService.getConfig(id);
      if (!config) {
        throw new HttpException(
          'Configuration not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return config;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all projects for a user
   */
  @Get('user/:userId/projects')
  async getUserProjects(@Param('userId') userId: string): Promise<Project[]> {
    // Use provided userId or default to 'default-user'
    const effectiveUserId = userId || 'default-user';
    return await this.configService.getUserProjects(effectiveUserId);
  }

  /**
   * Update an existing project
   */
  @Put(':id')
  async updateConfig(
    @Param('id') id: string,
    @Body()
    body: {
      teamConfig?: TeamConfig;
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
      status?: ProjectStatus;
      userId?: string;
    },
  ): Promise<Project> {
    try {
      // Use provided userId or default to 'default-user'
      const userId = body.userId || 'default-user';

      return await this.configService.updateConfig(id, userId, {
        teamConfig: body.teamConfig,
        sprintPlan: body.sprintPlan,
        raciChart: body.raciChart,
        adrDocument: body.adrDocument,
        status: body.status,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a project
   */
  @Delete(':id/:userId')
  async deleteConfig(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<{ success: boolean }> {
    try {
      // Use provided userId or default to 'default-user'
      const effectiveUserId = userId || 'default-user';
      const success = await this.configService.deleteConfig(id, effectiveUserId);

      if (!success) {
        throw new HttpException(
          'Configuration not found or unauthorized',
          HttpStatus.NOT_FOUND,
        );
      }

      return { success };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
