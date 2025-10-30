import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface TeamMember {
  name: string;
  role: string;
  skills: string[];
}

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.css'],
  standalone: false
})
export class TeamManagementComponent implements OnInit {
  teamMembers: TeamMember[] = [];

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  private loadTeamMembers(): void {
    // TODO: Load from API or localStorage
    const saved = localStorage.getItem('teamMembers');
    if (saved) {
      try {
        this.teamMembers = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    }
  }

  addTeamMember(): void {
    // Simple prompt-based add for now
    const name = prompt('Enter team member name:');
    if (!name) return;

    const role = prompt('Enter role (e.g., Developer, Designer, QA, Product Manager):');
    if (!role) return;

    const skillsInput = prompt('Enter skills (comma-separated):');
    const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()) : [];

    const newMember: TeamMember = { name, role, skills };
    this.teamMembers.push(newMember);
    this.saveTeamMembers();
  }

  removeTeamMember(index: number): void {
    if (confirm('Are you sure you want to remove this team member?')) {
      this.teamMembers.splice(index, 1);
      this.saveTeamMembers();
    }
  }

  private saveTeamMembers(): void {
    localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
  }

  goBack(): void {
    this.location.back();
  }
}
