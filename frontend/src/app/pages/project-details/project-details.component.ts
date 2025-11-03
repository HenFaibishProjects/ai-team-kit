import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import type { TeamConfig, Agent, FeatureConfig } from '../../shared/types';

export enum ProjectStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
}

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone: false
})
export class ProjectDetailsComponent implements OnInit {
  teamConfig: Partial<TeamConfig> = {};
  projectId: string = '';
  projectName: string = '';
  githubUrl: string = '';
  projectType: string = '';
  projectStatus: ProjectStatus = ProjectStatus.NOT_STARTED;
  agents: Agent[] = [];
  features: FeatureConfig[] = [];
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  
  // Edit mode
  isEditMode: boolean = false;
  editedProjectName: string = '';
  editedGithubUrl: string = '';
  editedStatus: ProjectStatus = ProjectStatus.NOT_STARTED;
  
  // Status options
  ProjectStatus = ProjectStatus;
  statusOptions = [
    { value: ProjectStatus.NOT_STARTED, label: 'Not Started', icon: 'schedule' },
    { value: ProjectStatus.IN_PROGRESS, label: 'In Progress', icon: 'autorenew' },
    { value: ProjectStatus.ON_HOLD, label: 'On Hold', icon: 'pause_circle' },
    { value: ProjectStatus.COMPLETED, label: 'Completed', icon: 'check_circle' }
  ];

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get project ID from query params
    this.route.queryParams.subscribe(params => {
      this.projectId = params['id'];
      if (this.projectId) {
        this.loadProjectById(this.projectId);
      } else {
        this.loadCurrentProject();
      }
    });
  }

  private loadProjectById(projectId: string): void {
    this.teamService.getUserProjects().subscribe({
      next: (projects) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          this.teamConfig = project.teamConfig;
          this.projectName = project.teamConfig.projectName;
          this.githubUrl = project.githubUrl || '';
          this.projectType = project.projectType || 'new';
          this.projectStatus = project.status as ProjectStatus;
          this.agents = project.teamConfig.agents || [];
          this.features = project.teamConfig.features || [];
          this.createdAt = project.createdAt;
          this.updatedAt = project.updatedAt;
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private loadCurrentProject(): void {
    this.teamConfig = this.teamService.getTeamConfig();
    
    // If no project configured, redirect to wizard
    if (!this.teamConfig.projectName) {
      this.router.navigate(['/wizard']);
      return;
    }

    this.projectName = this.teamConfig.projectName || '';
    this.githubUrl = this.teamService.getGithubProjectUrl() || '';
    this.projectType = this.teamService.getProjectType() || 'new';
    this.projectStatus = ProjectStatus.IN_PROGRESS; // Default for current project
    this.agents = this.teamConfig.agents || [];
    this.features = this.teamConfig.features || [];
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.editedProjectName = this.projectName;
    this.editedGithubUrl = this.githubUrl;
    this.editedStatus = this.projectStatus;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editedProjectName = '';
    this.editedGithubUrl = '';
    this.editedStatus = this.projectStatus;
  }

  saveChanges(): void {
    if (!this.editedProjectName.trim()) {
      alert('Project name is required');
      return;
    }

    // Update local values
    this.projectName = this.editedProjectName;
    this.githubUrl = this.editedGithubUrl;
    this.projectStatus = this.editedStatus;
    this.updatedAt = new Date();

    // TODO: Call API to save changes when backend is ready
    // For now, just update local state
    if (this.projectId) {
      // Update via API
      console.log('Saving project changes:', {
        projectId: this.projectId,
        projectName: this.projectName,
        githubUrl: this.githubUrl,
        status: this.projectStatus
      });
    }

    this.isEditMode = false;
  }

  getStatusLabel(status: ProjectStatus): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusIcon(status: ProjectStatus): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.icon : 'help';
  }

  getStatusClass(status: ProjectStatus): string {
    return `status-${status.replace('_', '-')}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navigateToSprintPlanning(): void {
    this.router.navigate(['/sprint-planning']);
  }

  navigateToRaci(): void {
    this.router.navigate(['/raci']);
  }

  navigateToExport(): void {
    this.router.navigate(['/export']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  editProject(): void {
    this.router.navigate(['/wizard']);
  }
}
