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

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService
  ) {
    this.featureForm = this.fb.group({
      features: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addFeature();
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
      this.teamService.setFeatures(features);
      this.complete.emit();
    }
  }
}
