import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed';
  githubUrl?: string;
  teamSize: number;
  startDate: Date;
  lastUpdated: Date;
  progress: number;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  standalone: false
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  filterStatus: string = 'all';
  searchTerm: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';

    this.authService.getUserProjects().subscribe({
      next: (response: any) => {
        // Transform backend data to match our interface
        this.projects = response.map((project: any) => ({
          id: project.id,
          name: project.projectName,
          description: `${project.teamMemberCount} team members, ${project.featureCount} features`,
          status: project.status || 'not_started',
          githubUrl: project.githubUrl,
          teamSize: project.teamMemberCount,
          startDate: new Date(project.createdAt),
          lastUpdated: new Date(project.updatedAt),
          progress: this.calculateProgress(project.status)
        }));
        
        this.filteredProjects = [...this.projects];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        this.error = 'Failed to load projects. Please try again.';
        this.loading = false;
        this.projects = [];
        this.filteredProjects = [];
      }
    });
  }

  private calculateProgress(status: string): number {
    // Calculate progress based on status
    const progressMap: { [key: string]: number } = {
      'not_started': 0,
      'in_progress': 50,
      'on_hold': 30,
      'completed': 100
    };
    return progressMap[status] || 0;
  }

  filterProjects(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProjects = this.projects.filter(project => {
      const matchesStatus = this.filterStatus === 'all' || project.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'on_hold': 'On Hold',
      'completed': 'Completed'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.replace('_', '-')}`;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'not_started': 'schedule',
      'in_progress': 'autorenew',
      'on_hold': 'pause_circle',
      'completed': 'check_circle'
    };
    return icons[status] || 'help';
  }

  viewProject(project: Project): void {
    // Navigate to project details
    this.router.navigate(['/project-details'], { queryParams: { id: project.id } });
  }

  createNewProject(): void {
    this.router.navigate(['/wizard']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getProjectCount(status: string): number {
    if (status === 'all') {
      return this.projects.length;
    }
    return this.projects.filter(p => p.status === status).length;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  getAverageProgress(): number {
    if (this.projects.length === 0) return 0;
    const total = this.projects.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / this.projects.length);
  }
}
