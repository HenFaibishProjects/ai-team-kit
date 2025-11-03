import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { TeamService } from '../../services/team.service';
import type { TeamConfig } from '../../shared/types';

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
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
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

  onFeatureSetupBack(): void {
    this.stepper.previous();
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

  exitWizard(): void {
    const dialogRef = this.dialog.open(ExitWizardDialogComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'exit-wizard-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Clear any unsaved data
        this.teamService.clearTeamConfig();
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }
    });
  }
}

// Exit Wizard Dialog Component
@Component({
  selector: 'app-exit-wizard-dialog',
  template: `
    <div class="exit-dialog-container">
      <div class="dialog-icon">
        <mat-icon>warning</mat-icon>
      </div>
      <h2 mat-dialog-title>Exit Project Wizard?</h2>
      <mat-dialog-content>
        <p class="warning-text">
          Are you sure you want to exit the wizard?
        </p>
        <p class="info-text">
          <mat-icon>info</mat-icon>
          All unsaved progress will be lost and you'll return to the dashboard.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close class="cancel-btn">
          <mat-icon>close</mat-icon>
          Stay in Wizard
        </button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true" class="confirm-btn">
          <mat-icon>exit_to_app</mat-icon>
          Yes, Exit Wizard
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .exit-dialog-container {
      padding: 1rem;
    }

    .dialog-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .dialog-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ff9800;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }

    h2 {
      text-align: center;
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    mat-dialog-content {
      padding: 1rem 0;
    }

    .warning-text {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
      text-align: center;
    }

    .info-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(255, 152, 0, 0.1);
      border-left: 4px solid #ff9800;
      border-radius: 4px;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .info-text mat-icon {
      color: #ff9800;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-dialog-actions {
      padding: 1.5rem 0 0.5rem 0;
      gap: 1rem;
    }

    .cancel-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .confirm-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `],
  standalone: false
})
export class ExitWizardDialogComponent {}
