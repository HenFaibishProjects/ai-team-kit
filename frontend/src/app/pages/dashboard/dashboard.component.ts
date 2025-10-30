import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../services/team.service';

export enum ProjectStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
}

export interface ProjectSummary {
  id: string;
  projectName: string;
  status: ProjectStatus;
  teamMemberCount: number;
  featureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  projects: ProjectSummary[] = [];
  loading = false;
  error: string | null = null;

  // For displaying in the UI
  ProjectStatus = ProjectStatus;

  constructor(
    private router: Router,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    // TODO: When authentication is implemented, get userId from auth service
    const userId = 'temp-user-id';
    
    this.loading = true;
    this.error = null;

    // TODO: Replace with actual API call to get user projects
    // For now, we'll use mock data or check if there's a stored config
    this.teamService.getUserProjects(userId).subscribe({
      next: (projects) => {
        this.projects = projects.map(p => ({
          id: p.id,
          projectName: p.teamConfig.projectName,
          status: p.status as ProjectStatus,
          teamMemberCount: p.teamConfig.agents.length,
          featureCount: p.teamConfig.features.length,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        this.loading = false;
      },
      error: (err) => {
        // Don't show error for empty projects, just show empty state
        if (err.status === 404 || err.error?.message?.includes('No projects found')) {
          this.projects = [];
        } else {
          this.error = 'Failed to load projects';
        }
        this.loading = false;
        console.error(err);
      }
    });
  }

  setupOrganization(): void {
    // TODO: Navigate to organization setup page
    // For now, show a message
    alert('Organization setup coming soon! This will allow you to:\n\n' +
          '• Configure your organization name and description\n' +
          '• Define what your organization does\n' +
          '• Set up organization-wide settings\n' +
          '• Manage organization members');
    // this.router.navigate(['/organization/setup']);
  }

  createTeam(): void {
    // TODO: Navigate to team creation page
    // For now, show a message
    alert('Team creation coming soon! This will allow you to:\n\n' +
          '• Create teams within your organization\n' +
          '• Add team members with specific roles\n' +
          '• Assign skills to team members\n' +
          '• Manage team assignments to projects');
    // this.router.navigate(['/teams/create']);
  }

  createNewProject(): void {
    // Navigate to wizard to create new project
    this.router.navigate(['/wizard']);
  }

  openProject(projectId: string): void {
    // Navigate to project details/wizard with loaded data
    this.router.navigate(['/wizard'], { queryParams: { projectId } });
  }

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.NOT_STARTED]: 'Not Started',
      [ProjectStatus.IN_PROGRESS]: 'In Progress',
      [ProjectStatus.ON_HOLD]: 'On Hold',
      [ProjectStatus.COMPLETED]: 'Completed',
    };
    return labels[status];
  }

  getStatusColor(status: ProjectStatus): string {
    const colors: Record<ProjectStatus, string> = {
      [ProjectStatus.NOT_STARTED]: 'status-not-started',
      [ProjectStatus.IN_PROGRESS]: 'status-in-progress',
      [ProjectStatus.ON_HOLD]: 'status-on-hold',
      [ProjectStatus.COMPLETED]: 'status-completed',
    };
    return colors[status];
  }

  getStatusIcon(status: ProjectStatus): string {
    const icons: Record<ProjectStatus, string> = {
      [ProjectStatus.NOT_STARTED]: 'hourglass_empty',
      [ProjectStatus.IN_PROGRESS]: 'autorenew',
      [ProjectStatus.ON_HOLD]: 'pause_circle',
      [ProjectStatus.COMPLETED]: 'check_circle',
    };
    return icons[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  deleteProject(projectId: string, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this project?')) {
      // TODO: Call API to delete project
      this.teamService.deleteProject(projectId, 'temp-user-id').subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== projectId);
        },
        error: (err) => {
          this.error = 'Failed to delete project';
          console.error(err);
        }
      });
    }
  }
}
