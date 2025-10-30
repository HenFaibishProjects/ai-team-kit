import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import type { FeatureConfig } from '../../../../../shared/types';

@Component({
  selector: 'app-feature-setup',
  templateUrl: './feature-setup.component.html',
  styleUrls: ['./feature-setup.component.css'],
  standalone: false
})
export class FeatureSetupComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  featureForm: FormGroup;
  projectType: 'new' | 'existing' | null = null;
  githubProjectUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {
    this.featureForm = this.fb.group({
      features: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Don't add feature automatically - wait for project type selection
  }

  selectProjectType(type: 'new' | 'existing'): void {
    this.projectType = type;
    
    if (type === 'new') {
      // Set default features for new projects
      this.setDefaultFeatures();
    } else {
      // For existing projects, start with empty features array
      // User will link to GitHub project
      this.addFeature();
    }
  }

  setDefaultFeatures(): void {
    // Clear existing features
    while (this.features.length > 0) {
      this.features.removeAt(0);
    }

    // Add default features for new projects
    const defaultFeatures = [
      {
        name: 'User Authentication',
        scope: 'Implement secure user authentication system with login, registration, and password reset functionality',
        acceptanceCriteria: [
          'Users can register with email and password',
          'Users can log in with valid credentials',
          'Users can reset their password via email',
          'Session management is secure and persistent'
        ]
      },
      {
        name: 'Dashboard',
        scope: 'Create a main dashboard for users to view and manage their data',
        acceptanceCriteria: [
          'Dashboard displays key metrics and statistics',
          'Users can navigate to different sections from dashboard',
          'Dashboard is responsive and mobile-friendly'
        ]
      }
    ];

    defaultFeatures.forEach(feature => {
      const featureGroup = this.fb.group({
        name: [feature.name, Validators.required],
        scope: [feature.scope, Validators.required],
        acceptanceCriteria: this.fb.array(
          feature.acceptanceCriteria.map(criterion => 
            this.fb.control(criterion, Validators.required)
          )
        )
      });
      this.features.push(featureGroup);
    });
  }

  get features(): FormArray {
    return this.featureForm.get('features') as FormArray;
  }

  createFeatureForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      scope: ['', Validators.required],
      acceptanceCriteria: this.fb.array([this.fb.control('', Validators.required)])
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

  onSubmit(): void {
    if (this.featureForm.valid) {
      const features: FeatureConfig[] = this.featureForm.value.features;
      
      // Store GitHub project URL if it's an existing project
      if (this.projectType === 'existing' && this.githubProjectUrl) {
        this.teamService.setGithubProjectUrl(this.githubProjectUrl);
      }
      
      this.teamService.setFeatures(features);
      this.complete.emit();
    }
  }

  isFormValid(): boolean {
    if (!this.projectType) {
      return false;
    }
    
    if (this.projectType === 'existing' && !this.githubProjectUrl.trim()) {
      return false;
    }
    
    return this.featureForm.valid;
  }
}
