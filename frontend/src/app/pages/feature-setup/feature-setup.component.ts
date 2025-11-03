import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { GithubService, GitHubRepository, RepositoryDetails } from '../../services/github.service';
import type { FeatureConfig, Agent } from '../../shared/types';

@Component({
  selector: 'app-feature-setup',
  templateUrl: './feature-setup.component.html',
  styleUrls: ['./feature-setup.component.css'],
  standalone: false
})
export class FeatureSetupComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  featureForm: FormGroup;

  // Team members for assignment
  teamMembers: Agent[] = [];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private githubService: GithubService
  ) {
    this.featureForm = this.fb.group({
      features: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Load team members for assignment
    this.teamMembers = this.teamService.getAgents();
    
    // Add initial feature to show the form immediately
    if (this.features.length === 0) {
      this.addFeature();
    }
  }


  get features(): FormArray {
    return this.featureForm.get('features') as FormArray;
  }

  createFeatureForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      scope: ['', Validators.required],
      acceptanceCriteria: this.fb.array([this.fb.control('', Validators.required)]),
      assignedTo: [[] as string[]] // Array of agent IDs
    });
  }

  addFeature(): void {
    this.features.push(this.createFeatureForm());
  }

  removeFeature(index: number): void {
    if (this.features.length > 1) {
      this.features.removeAt(index);
    }
  }

  getCriteria(featureIndex: number): FormArray {
    return this.features.at(featureIndex).get('acceptanceCriteria') as FormArray;
  }

  addCriterion(featureIndex: number): void {
    this.getCriteria(featureIndex).push(this.fb.control('', Validators.required));
  }

  removeCriterion(featureIndex: number, criterionIndex: number): void {
    const criteria = this.getCriteria(featureIndex);
    if (criteria.length > 1) {
      criteria.removeAt(criterionIndex);
    }
  }

  /**
   * Toggle agent assignment for a feature
   */
  toggleAgentAssignment(featureIndex: number, agentId: string): void {
    const feature = this.features.at(featureIndex);
    const assignedTo = feature.get('assignedTo')?.value as string[] || [];
    
    const index = assignedTo.indexOf(agentId);
    if (index > -1) {
      // Remove agent
      assignedTo.splice(index, 1);
    } else {
      // Add agent
      assignedTo.push(agentId);
    }
    
    feature.patchValue({ assignedTo });
  }

  /**
   * Check if agent is assigned to feature
   */
  isAgentAssigned(featureIndex: number, agentId: string): boolean {
    const feature = this.features.at(featureIndex);
    const assignedTo = feature.get('assignedTo')?.value as string[] || [];
    return assignedTo.includes(agentId);
  }

  /**
   * Get assigned agents for a feature
   */
  getAssignedAgents(featureIndex: number): Agent[] {
    const feature = this.features.at(featureIndex);
    const assignedTo = feature.get('assignedTo')?.value as string[] || [];
    return this.teamMembers.filter(agent => assignedTo.includes(agent.id));
  }

  /**
   * Format agent orientation for display
   */
  formatOrientation(orientation: string): string {
    return orientation.replace(/_/g, ' ');
  }

  /**
   * Get assigned agents names as comma-separated string
   */
  getAssignedAgentsNames(featureIndex: number): string {
    const agents = this.getAssignedAgents(featureIndex);
    return agents.map(a => a.name).join(', ');
  }

  onSubmit(): void {
    if (this.featureForm.valid) {
      const features: FeatureConfig[] = this.featureForm.value.features;
      this.teamService.setFeatures(features);
      this.complete.emit();
    }
  }

  isFormValid(): boolean {
    return this.featureForm.valid && this.features.length > 0;
  }

  onBack(): void {
    this.back.emit();
  }
}
