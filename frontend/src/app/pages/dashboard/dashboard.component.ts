import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Dashboard now only shows action cards, no need to load projects
  }

  setupOrganization(): void {
    this.router.navigate(['/organization/setup']);
  }

  createTeam(): void {
    this.router.navigate(['/teams/manage']);
  }

  createNewProject(): void {
    // Navigate to wizard to create new project
    this.router.navigate(['/wizard']);
  }

  viewAllProjects(): void {
    this.router.navigate(['/projects']);
  }

  viewUserProjects(): void {
    this.router.navigate(['/user-projects']);
  }

  openAiCommandCenter(): void {
    this.router.navigate(['/ai-command-center']);
  }
}
