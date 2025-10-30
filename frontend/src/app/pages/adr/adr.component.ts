import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { ClipboardService } from '../../services/clipboard.service';
import type { Agent, FeatureConfig } from '../../../../../shared/types';

interface ArchitecturePattern {
  id: string;
  name: string;
  description: string;
  icon: string;
  bestFor: string[];
}

@Component({
  selector: 'app-adr',
  templateUrl: './adr.component.html',
  styleUrls: ['./adr.component.css'],
  standalone: false
})
export class AdrComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  
  selectionMode: 'manual' | 'ai' | null = null;
  adrForm: FormGroup;
  
  // Architecture patterns
  architecturePatterns: ArchitecturePattern[] = [
    {
      id: 'microservices',
      name: 'Microservices',
      description: 'Distributed architecture with independent, loosely coupled services',
      icon: 'hub',
      bestFor: ['Scalability', 'Team autonomy', 'Technology diversity']
    },
    {
      id: 'monolithic',
      name: 'Monolithic',
      description: 'Single-tiered application with tightly integrated components',
      icon: 'layers',
      bestFor: ['Simple deployment', 'Small teams', 'Rapid development']
    },
    {
      id: 'layered',
      name: 'Layered (N-Tier)',
      description: 'Organized into horizontal layers with specific responsibilities',
      icon: 'view_agenda',
      bestFor: ['Clear separation', 'Traditional apps', 'Team specialization']
    },
    {
      id: 'event-driven',
      name: 'Event-Driven',
      description: 'Components communicate through events and message queues',
      icon: 'notifications_active',
      bestFor: ['Real-time processing', 'Loose coupling', 'Async operations']
    },
    {
      id: 'serverless',
      name: 'Serverless',
      description: 'Function-as-a-Service with automatic scaling and management',
      icon: 'cloud',
      bestFor: ['Variable load', 'Cost optimization', 'Quick deployment']
    },
    {
      id: 'mvc',
      name: 'MVC/MVVM',
      description: 'Model-View-Controller or Model-View-ViewModel pattern',
      icon: 'account_tree',
      bestFor: ['Web applications', 'Clear UI separation', 'Testability']
    }
  ];
  
  selectedArchitecture: string = '';
  generatedPrompt: string = '';
  
  // Project data
  projectName: string = '';
  features: FeatureConfig[] = [];
  agents: Agent[] = [];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private clipboardService: ClipboardService
  ) {
    this.adrForm = this.fb.group({
      architecture: ['', Validators.required],
      rationale: ['', Validators.required],
      consequences: ['']
    });
  }

  ngOnInit(): void {
    const config = this.teamService.getTeamConfig();
    this.projectName = config.projectName || 'Your Project';
    this.features = config.features || [];
    this.agents = config.agents || [];
  }

  selectMode(mode: 'manual' | 'ai'): void {
    this.selectionMode = mode;
    if (mode === 'ai') {
      this.generateAIPrompt();
    }
  }

  selectArchitecture(architectureId: string): void {
    this.selectedArchitecture = architectureId;
    this.adrForm.patchValue({ architecture: architectureId });
  }

  generateAIPrompt(): void {
    const githubUrl = this.teamService.getGithubProjectUrl();
    
    let prompt = `# Architecture Decision Request

## Project Overview
**Project Name:** ${this.projectName}
${githubUrl ? `**GitHub Repository:** ${githubUrl}\n` : ''}

## Features to Implement
`;

    this.features.forEach((feature, index) => {
      prompt += `\n### ${index + 1}. ${feature.name}
**Scope:** ${feature.scope}
**Acceptance Criteria:**
`;
      feature.acceptanceCriteria.forEach(criterion => {
        prompt += `- ${criterion}\n`;
      });
    });

    prompt += `\n## Team Composition\n`;
    this.agents.forEach(agent => {
      prompt += `\n### ${agent.name}
- **Role:** ${agent.orientation}
- **Strengths:** ${agent.strengths.join(', ')}
`;
    });

    prompt += `\n## Request

Based on the project requirements, features, and team composition above, please:

1. **Recommend the most suitable architecture pattern** from the following options:
   - Microservices
   - Monolithic
   - Layered (N-Tier)
   - Event-Driven
   - Serverless
   - MVC/MVVM
   - Or suggest a hybrid approach

2. **Provide detailed rationale** explaining:
   - Why this architecture fits the project requirements
   - How it aligns with the team's strengths and expertise
   - How it supports the planned features
   - Scalability and maintainability considerations

3. **Outline potential consequences**:
   - Benefits of this architectural choice
   - Potential challenges or trade-offs
   - Recommendations for implementation

4. **Suggest technology stack** that works well with the recommended architecture

Please provide a comprehensive analysis that will help the team make an informed architectural decision.`;

    this.generatedPrompt = prompt;
  }

  copyPrompt(): void {
    this.clipboardService.copyToClipboard(this.generatedPrompt, 'AI prompt copied to clipboard!');
  }

  onSubmit(): void {
    if (this.adrForm.valid) {
      const adrData = this.adrForm.value;
      console.log('Architecture Decision:', adrData);
      // Store the decision
      this.complete.emit();
    }
  }

  getArchitectureDetails(id: string): ArchitecturePattern | undefined {
    return this.architecturePatterns.find(p => p.id === id);
  }
}
