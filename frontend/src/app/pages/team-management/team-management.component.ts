import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface TeamMember {
  name: string;
  orientation: string;
  skills: string[];
  strengths: string[];
  constraints: string[];
  preferences: {
    cost_sensitivity: number;
    security_rigidity: number;
    maintainability: number;
    performance: number;
  };
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
      skills: [''],
      strengths: this.fb.array([this.fb.control('')]),
      constraints: this.fb.array([this.fb.control('')]),
      preferences: this.fb.group({
        cost_sensitivity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
        security_rigidity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
        maintainability: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
        performance: [5, [Validators.required, Validators.min(1), Validators.max(10)]]
      })
    });
  }

  get strengths(): FormArray {
    return this.memberForm.get('strengths') as FormArray;
  }

  get constraints(): FormArray {
    return this.memberForm.get('constraints') as FormArray;
  }

  addStrength(): void {
    this.strengths.push(this.fb.control(''));
  }

  removeStrength(index: number): void {
    if (this.strengths.length > 1) {
      this.strengths.removeAt(index);
    }
  }

  addConstraint(): void {
    this.constraints.push(this.fb.control(''));
  }

  removeConstraint(index: number): void {
    if (this.constraints.length > 1) {
      this.constraints.removeAt(index);
    }
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
        skills: formValue.skills ? formValue.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
        strengths: formValue.strengths.filter((s: string) => s && s.trim() !== ''),
        constraints: formValue.constraints.filter((c: string) => c && c.trim() !== ''),
        preferences: formValue.preferences
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
        this.memberForm.reset({ avatar: 'person' });
        this.resetFormArrays();
      }, 500);
    }
  }

  private resetFormArrays(): void {
    this.strengths.clear();
    this.strengths.push(this.fb.control(''));
    this.constraints.clear();
    this.constraints.push(this.fb.control(''));
  }

  editMember(index: number): void {
    const member = this.teamMembers[index];
    this.editingIndex = index;
    this.showAddForm = true;
    
    // Clear and populate strengths
    this.strengths.clear();
    if (member.strengths && member.strengths.length > 0) {
      member.strengths.forEach(s => this.strengths.push(this.fb.control(s)));
    } else {
      this.strengths.push(this.fb.control(''));
    }

    // Clear and populate constraints
    this.constraints.clear();
    if (member.constraints && member.constraints.length > 0) {
      member.constraints.forEach(c => this.constraints.push(this.fb.control(c)));
    } else {
      this.constraints.push(this.fb.control(''));
    }
    
    this.memberForm.patchValue({
      name: member.name,
      orientation: member.orientation,
      skills: member.skills.join(', '),
      preferences: member.preferences || {
        cost_sensitivity: 5,
        security_rigidity: 5,
        maintainability: 5,
        performance: 5
      }
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

  getRoleLabel(orientation: string): string {
    const labels: { [key: string]: string } = {
      'backend': 'Backend Developer',
      'frontend': 'Frontend Developer',
      'fullstack': 'Full Stack Developer',
      'devops': 'DevOps Engineer',
      'qa': 'QA Engineer',
      'architect': 'Software Architect',
      'pm': 'Product Manager',
      'designer': 'UI/UX Designer',
      'tech_lead': 'Tech Lead',
      'mobile': 'Mobile Developer',
      'data_engineer': 'Data Engineer',
      'scrum_master': 'Scrum Master',
      'security': 'Security Engineer',
      'sre': 'Site Reliability Engineer',
      'business_analyst': 'Business Analyst'
    };
    return labels[orientation] || orientation;
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
