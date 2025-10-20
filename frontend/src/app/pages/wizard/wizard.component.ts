import { Component, OnInit, ViewChild } from '@angular/core';
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
  
  constructor(private teamService: TeamService) {}

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

  onSprintPlanningComplete(): void {
    this.stepper.next();
  }

  onRaciComplete(): void {
    this.stepper.next();
  }

  onAdrComplete(): void {
    this.stepper.next();
  }

  isTeamSetupValid(): boolean {
    return !!(this.teamConfig.projectName && this.teamConfig.agents && this.teamConfig.agents.length > 0);
  }

  isFeaturesValid(): boolean {
    return !!(this.teamConfig.features && this.teamConfig.features.length > 0);
  }
}
