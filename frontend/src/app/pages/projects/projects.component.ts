import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    // TODO: Replace with actual API call
    // For now, load from localStorage or use mock data
    const savedProjects = localStorage.getItem('projects');
    
    if (savedProjects) {
      this.projects = JSON.parse(savedProjects);
    } else {
      // Mock data for demonstration
      this.projects = [
        {
          id: '1',
          name: 'AI Team Kit',
          description: 'AI-powered team management and project planning tool',
          status: 'in_progress',
          githubUrl: 'https://github.com/example/ai-team-kit',
          teamSize: 5,
          startDate: new Date('2024-01-15'),
          lastUpdated: new Date(),
          progress: 65
        },
        {
          id: '2',
          name: 'E-Commerce Platform',
          description: 'Modern e-commerce solution with AI recommendations',
          status: 'in_progress',
          githubUrl: 'https://github.com/example/ecommerce',
          teamSize: 8,
          startDate: new Date('2024-02-01'),
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          progress: 45
        },
        {
          id: '3',
          name: 'Mobile App Redesign',
          description: 'Complete redesign of mobile application UI/UX',
          status: 'completed',
          teamSize: 4,
          startDate: new Date('2023-11-01'),
          lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          progress: 100
        },
        {
          id: '4',
          name: 'Data Analytics Dashboard',
          description: 'Real-time analytics and reporting dashboard',
          status: 'on_hold',
          githubUrl: 'https://github.com/example/analytics',
          teamSize: 3,
          startDate: new Date('2024-03-01'),
          lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          progress: 30
        },
        {
          id: '5',
          name: 'API Gateway Service',
          description: 'Microservices API gateway with authentication',
          status: 'not_started',
          teamSize: 6,
          startDate: new Date('2024-04-01'),
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          progress: 0
        }
      ];
    }
    
    this.filteredProjects = [...this.projects];
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
