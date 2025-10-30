import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import type { Agent, Orientation } from '../../../../../shared/types';

interface AvailableTeamMember {
  name: string;
  orientation: string;
  skills: string[];
}

@Component({
  selector: 'app-team-setup',
  templateUrl: './team-setup.component.html',
  styleUrls: ['./team-setup.component.css'],
  standalone: false
})
export class TeamSetupComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  teamSetupForm: FormGroup;
  availableMembers: AvailableTeamMember[] = [];
  
  orientations: Orientation[] = [
    'lead_architect_scrummaster',
    'fullstack_backend',
    'fullstack_frontend',
    'junior_fullstack',
    'ux_ui',
    'devops',
    'qa_automation',
  ];

  orientationLabels: Record<Orientation, string> = {
    lead_architect_scrummaster: 'Lead Architect / Scrum Master',
    fullstack_backend: 'Full-stack (Backend Focus)',
    fullstack_frontend: 'Full-stack (Frontend Focus)',
    junior_fullstack: 'Junior Full-stack',
    ux_ui: 'UX/UI Designer',
    devops: 'DevOps Engineer',
    qa_automation: 'QA Automation Engineer',
  };

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {
    this.teamSetupForm = this.fb.group({
      projectName: ['', Validators.required],
      agents: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadAvailableMembers();
    this.addAgent();
  }

  private loadAvailableMembers(): void {
    const saved = localStorage.getItem('teamMembers');
    if (saved) {
      try {
        this.availableMembers = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading team members:', error);
      }
    }
  }

  get agents(): FormArray {
    return this.teamSetupForm.get('agents') as FormArray;
  }

  createAgentForm(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      selectedMember: ['', Validators.required],
      name: ['', Validators.required],
      orientation: ['', Validators.required],
      strengths: this.fb.array([this.fb.control('')]),
      constraints: this.fb.array([this.fb.control('')]),
      preferences: this.fb.group({
        cost_sensitivity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
        security_rigidity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
        maintainability: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
        performance: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      }),
    });
  }

  onMemberSelected(agentIndex: number, memberName: string): void {
    const member = this.availableMembers.find(m => m.name === memberName);
    if (member) {
      const agent = this.agents.at(agentIndex);
      agent.patchValue({
        name: member.name,
        orientation: this.mapOrientationToType(member.orientation)
      });
      
      // Set strengths from skills
      const strengthsArray = agent.get('strengths') as FormArray;
      strengthsArray.clear();
      if (member.skills && member.skills.length > 0) {
        member.skills.forEach(skill => {
          strengthsArray.push(this.fb.control(skill));
        });
      } else {
        strengthsArray.push(this.fb.control(''));
      }
    }
  }

  private mapOrientationToType(orientation: string): Orientation {
    const mapping: { [key: string]: Orientation } = {
      'backend': 'fullstack_backend',
      'frontend': 'fullstack_frontend',
      'fullstack': 'fullstack_backend',
      'devops': 'devops',
      'qa': 'qa_automation',
      'architect': 'lead_architect_scrummaster',
      'pm': 'lead_architect_scrummaster',
      'designer': 'ux_ui'
    };
    return mapping[orientation] || 'fullstack_backend';
  }

  addAgent(): void {
    this.agents.push(this.createAgentForm());
  }

  removeAgent(index: number): void {
    if (this.agents.length > 1) {
      this.agents.removeAt(index);
    }
  }

  getStrengths(agentIndex: number): FormArray {
    return this.agents.at(agentIndex).get('strengths') as FormArray;
  }

  addStrength(agentIndex: number): void {
    this.getStrengths(agentIndex).push(this.fb.control(''));
  }

  removeStrength(agentIndex: number, strengthIndex: number): void {
    const strengths = this.getStrengths(agentIndex);
    if (strengths.length > 1) {
      strengths.removeAt(strengthIndex);
    }
  }

  getConstraints(agentIndex: number): FormArray {
    return this.agents.at(agentIndex).get('constraints') as FormArray;
  }

  addConstraint(agentIndex: number): void {
    this.getConstraints(agentIndex).push(this.fb.control(''));
  }

  removeConstraint(agentIndex: number, constraintIndex: number): void {
    const constraints = this.getConstraints(agentIndex);
    if (constraints.length > 1) {
      constraints.removeAt(constraintIndex);
    }
  }

  getPreferences(agentIndex: number): FormGroup {
    return this.agents.at(agentIndex).get('preferences') as FormGroup;
  }

  onSubmit(): void {
    if (this.teamSetupForm.valid) {
      const formValue = this.teamSetupForm.value;
      
      // Clean up empty strengths and constraints
      const agents: Agent[] = formValue.agents.map((agent: any) => ({
        ...agent,
        strengths: agent.strengths.filter((s: string) => s.trim() !== ''),
        constraints: agent.constraints.filter((c: string) => c.trim() !== ''),
      }));

      const teamConfig = {
        projectName: formValue.projectName,
        agents,
        features: [], // Will be added in next step
      };

      this.teamService.setTeamConfig(teamConfig);
      this.complete.emit();
    }
  }

  private generateId(): string {
    return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getOrientationLabel(orientation: Orientation): string {
    return this.orientationLabels[orientation];
  }

  getRoleIcon(orientation: Orientation): string {
    const iconMap: Record<Orientation, string> = {
      lead_architect_scrummaster: 'engineering',
      fullstack_backend: 'storage',
      fullstack_frontend: 'web',
      junior_fullstack: 'school',
      ux_ui: 'palette',
      devops: 'cloud_sync',
      qa_automation: 'bug_report',
    };
    return iconMap[orientation];
  }

  getRoleClass(orientation: Orientation): string {
    const classMap: Record<Orientation, string> = {
      lead_architect_scrummaster: 'architect',
      fullstack_backend: 'tech-lead',
      fullstack_frontend: 'developer',
      junior_fullstack: 'developer',
      ux_ui: 'designer',
      devops: 'devops',
      qa_automation: 'qa-engineer',
    };
    return classMap[orientation];
  }
}
