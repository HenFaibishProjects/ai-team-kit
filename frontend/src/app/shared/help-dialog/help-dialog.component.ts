import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface HelpDialogData {
  component: any;
  title: string;
}

@Component({
  selector: 'app-help-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="help-dialog-container">
      <div class="help-dialog-header">
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <button mat-icon-button (click)="close()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <mat-dialog-content class="help-dialog-content">
        <ng-container *ngComponentOutlet="data.component"></ng-container>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .help-dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 90vh;
    }

    .help-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -24px -24px 0 -24px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .close-button {
      color: white;
    }

    .help-dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: #f5f5f5;
    }

    ::ng-deep .help-dialog-content .help-container {
      max-width: 100%;
      padding: 0;
    }

    ::ng-deep .help-dialog-content .help-header {
      display: none;
    }

    ::ng-deep .help-dialog-content .back-button {
      display: none;
    }
  `]
})
export class HelpDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HelpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HelpDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
