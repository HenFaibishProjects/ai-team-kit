import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
   * TODO: Replace hardcoded userId with actual user from auth token
   */
  @Post('save')
  async saveConfig(
    @Body()
    body: {
      teamConfig: TeamConfig;
      userId?: string;
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
    },
  ): Promise<{ id: string; project: Project }> {
    try {
      // TODO: Get userId from authenticated session/token
      const userId = body.userId || 'temp-user-id';

      const project = await this.configService.saveConfig(
        userId,
        body.teamConfig,
        {
          sprintPlan: body.sprintPlan,
          raciChart: body.raciChart,
          adrDocument: body.adrDocument,
        },
      );

      return { id: project.id, project };
    } catch (error) {
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
   * TODO: Replace query param with actual user from auth token
   */
  @Get('user/:userId')
  async getUserProjects(@Param('userId') userId: string): Promise<Project[]> {
    try {
      return await this.configService.getUserProjects(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve user projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an existing project
   * TODO: Replace body.userId with actual user from auth token
   */
  @Put(':id')
  async updateConfig(
    @Param('id') id: string,
    @Body()
    body: {
      userId?: string;
      teamConfig?: TeamConfig;
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
      status?: ProjectStatus;
    },
  ): Promise<Project> {
    try {
      // TODO: Get userId from authenticated session/token
      const userId = body.userId || 'temp-user-id';

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
   * TODO: Replace query param with actual user from auth token
   */
  @Delete(':id')
  async deleteConfig(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<{ success: boolean }> {
    try {
      // TODO: Get userId from authenticated session/token
      const user = userId || 'temp-user-id';
      const success = await this.configService.deleteConfig(id, user);

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
