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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import type { TeamConfig } from '../../shared/types';
import { Project } from '../../entities/project.entity';
import { ProjectStatus } from '../../entities/project-status.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Save a new configuration
   */
  @Post('save')
  @UseGuards(JwtAuthGuard)
  async saveConfig(
    @Request() req: any,
    @Body()
    body: {
      teamConfig: TeamConfig;
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
    },
  ): Promise<{ id: string; project: Project }> {
    try {
      const userId = req.user.userId;

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
   * Get all projects for the authenticated user
   */
  @Get('user/projects')
  @UseGuards(JwtAuthGuard)
  async getUserProjects(@Request() req: any): Promise<Project[]> {
    const userId = req.user.userId;
    return await this.configService.getUserProjects(userId);
  }

  /**
   * Update an existing project
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateConfig(
    @Request() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      teamConfig?: TeamConfig;
      sprintPlan?: string;
      raciChart?: string;
      adrDocument?: string;
      status?: ProjectStatus;
    },
  ): Promise<Project> {
    try {
      const userId = req.user.userId;

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
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteConfig(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user.userId;
      const success = await this.configService.deleteConfig(id, userId);

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
