import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface TeamMember {
  name: string;
  orientation: string;
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
  memberForm!: FormGroup;
  showAddForm = false;
  saving = false;
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadTeamMembers();
  }

  private initializeForm(): void {
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      orientation: ['', Validators.required],
      skills: ['']
    });
  }

  private loadTeamMembers(): void {
    const saved = localStorage.getItem('teamMembers');
    if (saved) {
      try {
        this.teamMembers = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    }
  }

  showAddMemberForm(): void {
    this.showAddForm = true;
    this.editingIndex = null;
    this.memberForm.reset();
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.editingIndex = null;
    this.memberForm.reset();
  }

  saveMember(): void {
    if (this.memberForm.valid) {
      this.saving = true;
      
      const formValue = this.memberForm.value;
      const member: TeamMember = {
        name: formValue.name,
        orientation: formValue.orientation,
        skills: formValue.skills ? formValue.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
      };

      if (this.editingIndex !== null) {
        // Update existing member
        this.teamMembers[this.editingIndex] = member;
      } else {
        // Add new member
        this.teamMembers.push(member);
      }

      this.saveToStorage();
      
      setTimeout(() => {
        this.saving = false;
        this.showAddForm = false;
        this.editingIndex = null;
        this.memberForm.reset();
      }, 500);
    }
  }

  editMember(index: number): void {
    const member = this.teamMembers[index];
    this.editingIndex = index;
    this.showAddForm = true;
    
    this.memberForm.patchValue({
      name: member.name,
      orientation: member.orientation,
      skills: member.skills.join(', ')
    });
  }

  removeMember(index: number): void {
    if (confirm('Are you sure you want to remove this team member?')) {
      this.teamMembers.splice(index, 1);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
  }

  getRoleIcon(orientation: string): string {
    const icons: { [key: string]: string } = {
      'backend': 'storage',
      'frontend': 'web',
      'fullstack': 'code',
      'devops': 'cloud',
      'qa': 'bug_report',
      'architect': 'architecture',
      'pm': 'manage_accounts',
      'designer': 'palette'
    };
    return icons[orientation] || 'person';
  }

  getRoleLabel(orientation: string): string {
    const labels: { [key: string]: string } = {
      'backend': 'Backend Developer',
      'frontend': 'Frontend Developer',
      'fullstack': 'Full Stack Developer',
      'devops': 'DevOps Engineer',
      'qa': 'QA Engineer',
      'architect': 'Software Architect',
      'pm': 'Product Manager',
      'designer': 'UI/UX Designer'
    };
    return labels[orientation] || orientation;
  }

  goBack(): void {
    this.location.back();
  }
}
