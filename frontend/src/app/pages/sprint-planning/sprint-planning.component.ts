import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import type { Agent, FeatureConfig } from '../../shared/types';

interface Task {
  name: string;
  description: string;
  assignedTo: string;
  estimatedDays?: number;
}

interface FeatureWithTasks extends FeatureConfig {
  tasks: Task[];
}

@Component({
  selector: 'app-feature-planning',
  templateUrl: './sprint-planning.component.html',
  styleUrls: ['./sprint-planning.component.css'],
  standalone: false
})
export class FeaturePlanningComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  
  planningForm: FormGroup;
  features: FeatureConfig[] = [];
  agents: Agent[] = [];
  featuresWithTasks: FeatureWithTasks[] = [];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {
    this.planningForm = this.fb.group({
      features: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const config = this.teamService.getTeamConfig();
    this.features = config.features || [];
    this.agents = config.agents || [];
    
    // Initialize features with tasks
    this.features.forEach(feature => {
      this.featuresWithTasks.push({
        ...feature,
        tasks: []
      });
      this.addFeatureGroup(feature);
    });
  }

  get featureGroups(): FormArray {
    return this.planningForm.get('features') as FormArray;
  }

  addFeatureGroup(feature: FeatureConfig): void {
    const featureGroup = this.fb.group({
      featureName: [feature.name],
      tasks: this.fb.array([])
    });
    this.featureGroups.push(featureGroup);
  }

  getTasks(featureIndex: number): FormArray {
    return this.featureGroups.at(featureIndex).get('tasks') as FormArray;
  }

  addTask(featureIndex: number): void {
    const taskGroup = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      assignedTo: ['', Validators.required],
      estimatedDays: [null, [Validators.min(0)]]
    });
    this.getTasks(featureIndex).push(taskGroup);
  }

  removeTask(featureIndex: number, taskIndex: number): void {
    this.getTasks(featureIndex).removeAt(taskIndex);
  }

  onSubmit(): void {
    if (this.planningForm.valid) {
      // Store the planning data
      const planningData = this.planningForm.value;
      console.log('Feature Planning Data:', planningData);
      this.complete.emit();
    }
  }

  getTotalDays(featureIndex: number): number {
    const tasks = this.getTasks(featureIndex).value;
    return tasks.reduce((sum: number, task: Task) => sum + (task.estimatedDays || 0), 0);
  }

  getAgentName(agentId: string): string {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
  }
}
