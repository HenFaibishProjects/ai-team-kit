import { Component, OnInit, ViewChild } from '@angular/core';
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
  
  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.teamService.teamConfig$.subscribe(config => {
      this.teamConfig = config;
    });
  }

  onTeamSetupComplete(): void {
    this.stepper.next();
  }

  onFeatureSetupComplete(): void {
    this.stepper.next();
  }

  onFeaturePlanningComplete(): void {
    this.stepper.next();
  }

  onRaciComplete(): void {
    this.stepper.next();
  }

  onAdrComplete(): void {
    // Navigate to feature management/dashboard after completing the wizard
    this.router.navigate(['/dashboard']);
  }

  isTeamSetupValid(): boolean {
    return !!(this.teamConfig.projectName && this.teamConfig.agents && this.teamConfig.agents.length > 0);
  }

  isFeaturesValid(): boolean {
    return !!(this.teamConfig.features && this.teamConfig.features.length > 0);
  }
}
