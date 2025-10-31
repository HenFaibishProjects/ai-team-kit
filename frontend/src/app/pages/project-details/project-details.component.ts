import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import type { TeamConfig, Agent, FeatureConfig } from '../../../../../shared/types';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  standalone: false
})
export class ProjectDetailsComponent implements OnInit {
  teamConfig: Partial<TeamConfig> = {};
  projectName: string = '';
  githubUrl: string = '';
  projectType: string = '';
  agents: Agent[] = [];
  features: FeatureConfig[] = [];

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teamConfig = this.teamService.getTeamConfig();
    
    // If no project configured, redirect to wizard
    if (!this.teamConfig.projectName) {
      this.router.navigate(['/wizard']);
      return;
    }

    this.projectName = this.teamConfig.projectName || '';
    this.githubUrl = this.teamService.getGithubProjectUrl() || '';
    this.projectType = this.teamService.getProjectType() || 'new';
    this.agents = this.teamConfig.agents || [];
    this.features = this.teamConfig.features || [];
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

  editProject(): void {
    this.router.navigate(['/wizard']);
  }
}
