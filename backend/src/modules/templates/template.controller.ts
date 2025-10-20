import { Controller, Get } from '@nestjs/common';
import { TemplateService } from './template.service';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  getTemplates(): Template[] {
    return [
      {
        id: 'team-setup',
        name: 'Team Setup',
        description: 'Configure your team members and their roles',
        category: 'setup',
      },
      {
        id: 'feature-planning',
        name: 'Feature Planning',
        description: 'Define features and acceptance criteria',
        category: 'planning',
      },
      {
        id: 'sprint-planning',
        name: 'Sprint Planning',
        description: 'Plan your sprint with task breakdown',
        category: 'planning',
      },
      {
        id: 'raci-matrix',
        name: 'RACI Matrix',
        description: 'Define responsibilities using RACI framework',
        category: 'documentation',
      },
      {
        id: 'adr',
        name: 'Architecture Decision Record',
        description: 'Document architectural decisions',
        category: 'documentation',
      },
    ];
  }
}
