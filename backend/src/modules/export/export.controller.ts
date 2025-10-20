import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { TeamConfig } from '../../shared/types';

interface ExportPayload {
  teamConfig: TeamConfig;
  sprint?: string;
  raci?: string;
  adr?: string;
}

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('zip')
  async exportZip(
    @Body() payload: ExportPayload,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const files: Array<{ name: string; content: string }> = [];

      // Generate team config markdown
      files.push({
        name: 'team-config.md',
        content: this.generateTeamConfigMarkdown(payload.teamConfig),
      });

      // Add sprint planning if provided
      if (payload.sprint) {
        files.push({
          name: 'sprint-planning.md',
          content: payload.sprint,
        });
      }

      // Add RACI matrix if provided
      if (payload.raci) {
        files.push({
          name: 'raci-matrix.md',
          content: payload.raci,
        });
      }

      // Add ADR if provided
      if (payload.adr) {
        files.push({
          name: 'architecture-decision-record.md',
          content: payload.adr,
        });
      }

      // Create ZIP file
      const zipBuffer = await this.exportService.createZip(files);

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${payload.teamConfig.projectName || 'export'}.zip"`,
      );
      res.setHeader('Content-Length', zipBuffer.length);

      // Send the buffer
      res.status(HttpStatus.OK).send(zipBuffer);
    } catch {
      throw new HttpException(
        'Failed to generate export',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateTeamConfigMarkdown(config: TeamConfig): string {
    let markdown = `# ${config.projectName}\n\n`;
    markdown += `## Team Configuration\n\n`;

    // Add agents section
    markdown += `### Team Members\n\n`;
    config.agents.forEach((agent) => {
      markdown += `#### ${agent.name}\n`;
      markdown += `- **Role**: ${agent.orientation}\n`;
      markdown += `- **Strengths**: ${agent.strengths.join(', ')}\n`;
      markdown += `- **Constraints**: ${agent.constraints.join(', ')}\n`;
      markdown += `- **Preferences**:\n`;
      markdown += `  - Cost Sensitivity: ${agent.preferences.cost_sensitivity}\n`;
      markdown += `  - Security Rigidity: ${agent.preferences.security_rigidity}\n`;
      markdown += `  - Maintainability: ${agent.preferences.maintainability}\n`;
      markdown += `  - Performance: ${agent.preferences.performance}\n\n`;
    });

    // Add features section
    markdown += `### Features\n\n`;
    config.features.forEach((feature) => {
      markdown += `#### ${feature.name}\n`;
      markdown += `**Scope**: ${feature.scope}\n\n`;
      markdown += `**Acceptance Criteria**:\n`;
      feature.acceptanceCriteria.forEach((criteria) => {
        markdown += `- ${criteria}\n`;
      });
      markdown += `\n`;
    });

    return markdown;
  }
}
