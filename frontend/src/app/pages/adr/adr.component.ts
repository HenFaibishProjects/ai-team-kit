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
  category: string;
  bestFor: string[];
}

interface PatternCategory {
  name: string;
  description: string;
  patterns: ArchitecturePattern[];
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
  
  // Architecture patterns organized by category
  patternCategories: PatternCategory[] = [
    {
      name: 'Structural Patterns',
      description: 'Fundamental application structure and organization',
      patterns: [
        {
          id: 'monolithic',
          name: 'Monolithic',
          description: 'Single unified codebase',
          icon: 'layers',
          category: 'structural',
          bestFor: ['Simple deployment', 'Small teams']
        },
        {
          id: 'microservices',
          name: 'Microservices',
          description: 'Independent services',
          icon: 'hub',
          category: 'structural',
          bestFor: ['Scalability', 'Team autonomy']
        },
        {
          id: 'layered',
          name: 'Layered (N-Tier)',
          description: 'Horizontal layer separation',
          icon: 'view_agenda',
          category: 'structural',
          bestFor: ['Clear separation', 'Traditional apps']
        },
        {
          id: 'modular',
          name: 'Modular Monolith',
          description: 'Monolith with module boundaries',
          icon: 'view_module',
          category: 'structural',
          bestFor: ['Gradual scaling', 'Clear boundaries']
        },
        {
          id: 'hexagonal',
          name: 'Hexagonal (Ports & Adapters)',
          description: 'Core logic isolated from external concerns',
          icon: 'hexagon',
          category: 'structural',
          bestFor: ['Testability', 'Technology independence']
        },
        {
          id: 'clean',
          name: 'Clean Architecture',
          description: 'Dependency rule with concentric layers',
          icon: 'radio_button_unchecked',
          category: 'structural',
          bestFor: ['Maintainability', 'Framework independence']
        }
      ]
    },
    {
      name: 'Distributed Patterns',
      description: 'Patterns for distributed and scalable systems',
      patterns: [
        {
          id: 'soa',
          name: 'Service-Oriented (SOA)',
          description: 'Enterprise service bus architecture',
          icon: 'device_hub',
          category: 'distributed',
          bestFor: ['Enterprise integration', 'Reusability']
        },
        {
          id: 'event-driven',
          name: 'Event-Driven',
          description: 'Event-based communication',
          icon: 'notifications_active',
          category: 'distributed',
          bestFor: ['Real-time', 'Loose coupling']
        },
        {
          id: 'cqrs',
          name: 'CQRS',
          description: 'Separate read and write models',
          icon: 'call_split',
          category: 'distributed',
          bestFor: ['Complex domains', 'Performance']
        },
        {
          id: 'event-sourcing',
          name: 'Event Sourcing',
          description: 'Store events as source of truth',
          icon: 'history',
          category: 'distributed',
          bestFor: ['Audit trails', 'Time travel']
        },
        {
          id: 'saga',
          name: 'Saga Pattern',
          description: 'Distributed transaction management',
          icon: 'sync_alt',
          category: 'distributed',
          bestFor: ['Distributed transactions', 'Consistency']
        },
        {
          id: 'strangler-fig',
          name: 'Strangler Fig',
          description: 'Gradual legacy system replacement',
          icon: 'transform',
          category: 'distributed',
          bestFor: ['Migration', 'Risk reduction']
        }
      ]
    },
    {
      name: 'Cloud-Native Patterns',
      description: 'Modern cloud and serverless architectures',
      patterns: [
        {
          id: 'serverless',
          name: 'Serverless',
          description: 'Function-as-a-Service',
          icon: 'cloud',
          category: 'cloud',
          bestFor: ['Variable load', 'Cost optimization']
        },
        {
          id: 'cloud-native',
          name: 'Cloud-Native',
          description: 'Container-based microservices',
          icon: 'cloud_queue',
          category: 'cloud',
          bestFor: ['Kubernetes', 'Scalability']
        },
        {
          id: 'jamstack',
          name: 'JAMstack',
          description: 'JavaScript, APIs, and Markup',
          icon: 'web',
          category: 'cloud',
          bestFor: ['Static sites', 'Performance']
        },
        {
          id: 'backend-for-frontend',
          name: 'Backend for Frontend (BFF)',
          description: 'Dedicated backend per frontend',
          icon: 'phonelink',
          category: 'cloud',
          bestFor: ['Multiple clients', 'Optimization']
        },
        {
          id: 'api-gateway',
          name: 'API Gateway',
          description: 'Single entry point for APIs',
          icon: 'vpn_lock',
          category: 'cloud',
          bestFor: ['Microservices', 'Security']
        },
        {
          id: 'service-mesh',
          name: 'Service Mesh',
          description: 'Infrastructure layer for service communication',
          icon: 'grid_on',
          category: 'cloud',
          bestFor: ['Observability', 'Traffic management']
        }
      ]
    },
    {
      name: 'Application Patterns',
      description: 'Common application architecture patterns',
      patterns: [
        {
          id: 'mvc',
          name: 'MVC',
          description: 'Model-View-Controller',
          icon: 'account_tree',
          category: 'application',
          bestFor: ['Web apps', 'UI separation']
        },
        {
          id: 'mvvm',
          name: 'MVVM',
          description: 'Model-View-ViewModel',
          icon: 'view_in_ar',
          category: 'application',
          bestFor: ['Data binding', 'Reactive UIs']
        },
        {
          id: 'mvp',
          name: 'MVP',
          description: 'Model-View-Presenter',
          icon: 'present_to_all',
          category: 'application',
          bestFor: ['Testability', 'UI logic']
        },
        {
          id: 'spa',
          name: 'Single Page Application',
          description: 'Client-side rendered app',
          icon: 'web_asset',
          category: 'application',
          bestFor: ['Rich UX', 'Client-side routing']
        },
        {
          id: 'ssr',
          name: 'Server-Side Rendering',
          description: 'Server-rendered pages',
          icon: 'dns',
          category: 'application',
          bestFor: ['SEO', 'Initial load']
        },
        {
          id: 'pwa',
          name: 'Progressive Web App',
          description: 'Web app with native features',
          icon: 'install_mobile',
          category: 'application',
          bestFor: ['Offline support', 'Mobile-first']
        }
      ]
    },
    {
      name: 'Data Patterns',
      description: 'Data management and persistence patterns',
      patterns: [
        {
          id: 'repository',
          name: 'Repository Pattern',
          description: 'Data access abstraction',
          icon: 'storage',
          category: 'data',
          bestFor: ['Data abstraction', 'Testability']
        },
        {
          id: 'data-lake',
          name: 'Data Lake',
          description: 'Centralized raw data storage',
          icon: 'water',
          category: 'data',
          bestFor: ['Big data', 'Analytics']
        },
        {
          id: 'data-mesh',
          name: 'Data Mesh',
          description: 'Decentralized data ownership',
          icon: 'scatter_plot',
          category: 'data',
          bestFor: ['Domain ownership', 'Scalability']
        },
        {
          id: 'polyglot-persistence',
          name: 'Polyglot Persistence',
          description: 'Multiple database types',
          icon: 'database',
          category: 'data',
          bestFor: ['Optimal storage', 'Flexibility']
        },
        {
          id: 'caching',
          name: 'Caching Layer',
          description: 'Performance optimization layer',
          icon: 'speed',
          category: 'data',
          bestFor: ['Performance', 'Reduced load']
        },
        {
          id: 'sharding',
          name: 'Database Sharding',
          description: 'Horizontal data partitioning',
          icon: 'view_column',
          category: 'data',
          bestFor: ['Large datasets', 'Scalability']
        }
      ]
    },
    {
      name: 'Integration Patterns',
      description: 'System integration and communication patterns',
      patterns: [
        {
          id: 'rest',
          name: 'REST API',
          description: 'RESTful web services',
          icon: 'api',
          category: 'integration',
          bestFor: ['HTTP-based', 'Stateless']
        },
        {
          id: 'graphql',
          name: 'GraphQL',
          description: 'Query language for APIs',
          icon: 'query_stats',
          category: 'integration',
          bestFor: ['Flexible queries', 'Single endpoint']
        },
        {
          id: 'grpc',
          name: 'gRPC',
          description: 'High-performance RPC framework',
          icon: 'flash_on',
          category: 'integration',
          bestFor: ['Performance', 'Microservices']
        },
        {
          id: 'message-queue',
          name: 'Message Queue',
          description: 'Asynchronous messaging',
          icon: 'queue',
          category: 'integration',
          bestFor: ['Async processing', 'Decoupling']
        },
        {
          id: 'pub-sub',
          name: 'Pub/Sub',
          description: 'Publish-subscribe messaging',
          icon: 'rss_feed',
          category: 'integration',
          bestFor: ['Broadcasting', 'Event distribution']
        },
        {
          id: 'webhook',
          name: 'Webhooks',
          description: 'HTTP callbacks for events',
          icon: 'webhook',
          category: 'integration',
          bestFor: ['Event notifications', 'Integration']
        }
      ]
    }
  ];
  
  architecturePatterns: ArchitecturePattern[] = [];
  
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
    
    // Flatten all patterns for easy lookup
    this.architecturePatterns = this.patternCategories.flatMap(category => category.patterns);
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
