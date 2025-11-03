import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { ClipboardService } from '../../services/clipboard.service';
import type { TeamConfig } from '../../shared/types';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
  standalone: false
})
export class ExportComponent implements OnInit {
  teamConfig: TeamConfig | null = null;
  loading = false;
  error: string | null = null;

  sprintData = '';
  raciData = '';
  adrData = '';

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private clipboardService: ClipboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const config = this.teamService.getTeamConfig();
    if (config.projectName && config.agents && config.features) {
      this.teamConfig = config as TeamConfig;
    }
  }

  onExport(): void {
    if (!this.teamConfig) {
      this.error = 'Team configuration is incomplete';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload = {
      teamConfig: this.teamConfig,
      sprint: this.sprintData || undefined,
      raci: this.raciData || undefined,
      adr: this.adrData || undefined
    };

    this.teamService.exportAsZip(payload).subscribe({
      next: (blob) => {
        const filename = `${this.teamConfig!.projectName.replace(/\s+/g, '-')}-export.zip`;
        this.teamService.downloadFile(blob, filename);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to export configuration: ' + err.message;
        this.loading = false;
      }
    });
  }

  onSaveConfig(): void {
    if (!this.teamConfig) {
      this.error = 'Team configuration is incomplete';
      return;
    }

    this.loading = true;
    this.error = null;

    this.teamService.saveConfig(this.teamConfig).subscribe({
      next: (response) => {
        alert(`Configuration saved with ID: ${response.id}`);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to save configuration: ' + err.message;
        this.loading = false;
      }
    });
  }

  copyToClipboard(content: string, type: string): void {
    this.clipboardService.copyToClipboard(content, `${type} copied to clipboard!`);
  }

  copySprintPlan(): void {
    this.copyToClipboard(this.sprintData, 'Sprint plan');
  }

  copyRaciChart(): void {
    this.copyToClipboard(this.raciData, 'RACI chart');
  }

  copyAdrDocument(): void {
    this.copyToClipboard(this.adrData, 'ADR document');
  }

  copyAllConfig(): void {
    const allContent = `Project: ${this.teamConfig?.projectName}\n\n` +
                      `=== SPRINT PLAN ===\n${this.sprintData}\n\n` +
                      `=== RACI CHART ===\n${this.raciData}\n\n` +
                      `=== ADR DOCUMENT ===\n${this.adrData}`;
    this.copyToClipboard(allContent, 'All content');
  }
}
