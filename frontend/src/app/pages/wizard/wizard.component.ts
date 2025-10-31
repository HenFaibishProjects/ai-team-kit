import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { TeamService } from '../../services/team.service';
import type { TeamConfig } from '../../../../../shared/types';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  standalone: false
})
export class WizardComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  teamConfig: Partial<TeamConfig> = {};
  teamSetupCompleted = false;
  featureSetupCompleted = false;
  
  constructor(
    private teamService: TeamService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.teamService.teamConfig$.subscribe(config => {
      this.teamConfig = config;
    });
  }

  onTeamSetupComplete(): void {
    this.teamSetupCompleted = true;
    this.cdr.detectChanges(); // Ensure the completed state is updated
    setTimeout(() => this.stepper.next(), 0); // Move to next step after change detection
  }

  onFeatureSetupComplete(): void {
    this.featureSetupCompleted = true;
    this.cdr.detectChanges(); // Ensure the completed state is updated
    setTimeout(() => this.stepper.next(), 0); // Move to next step after change detection
  }

  onFeaturePlanningComplete(): void {
    this.stepper.next();
  }

  onAdrComplete(): void {
    // Navigate to project details page after completing the wizard
    this.router.navigate(['/project-details']);
  }

  isTeamSetupValid(): boolean {
    return this.teamSetupCompleted || !!(this.teamConfig.projectName && this.teamConfig.agents && this.teamConfig.agents.length > 0);
  }

  isFeaturesValid(): boolean {
    return this.featureSetupCompleted || !!(this.teamConfig.features && this.teamConfig.features.length > 0);
  }
}
