import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import type { TeamConfig, Agent, FeatureConfig } from '../../../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = 'http://localhost:3000'; // Update with your backend URL
  
  private teamConfigSubject = new BehaviorSubject<Partial<TeamConfig>>({
    projectName: '',
    projectType: 'new',
    agents: [],
    features: [],
    githubProjectUrl: '',
  });
  
  public teamConfig$ = this.teamConfigSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get current team configuration
   */
  getTeamConfig(): Partial<TeamConfig> {
    return this.teamConfigSubject.value;
  }

  /**
   * Set the team configuration
   */
  setTeamConfig(config: Partial<TeamConfig>): void {
    this.teamConfigSubject.next({
      ...this.teamConfigSubject.value,
      ...config,
    });
  }

  /**
   * Update project name
   */
  setProjectName(projectName: string): void {
    this.setTeamConfig({ projectName });
  }

  /**
   * Update agents
   */
  setAgents(agents: Agent[]): void {
    this.setTeamConfig({ agents });
  }

  /**
   * Update features
   */
  setFeatures(features: FeatureConfig[]): void {
    this.setTeamConfig({ features });
  }

  /**
   * Set GitHub project URL
   */
  setGithubProjectUrl(url: string): void {
    this.setTeamConfig({ githubProjectUrl: url });
  }

  /**
   * Get GitHub project URL
   */
  getGithubProjectUrl(): string {
    return this.teamConfigSubject.value.githubProjectUrl || '';
  }

  /**
   * Set project type (new or existing)
   */
  setProjectType(projectType: 'new' | 'existing'): void {
    this.setTeamConfig({ projectType });
  }

  /**
   * Get project type
   */
  getProjectType(): 'new' | 'existing' {
    return this.teamConfigSubject.value.projectType || 'new';
  }

  /**
   * Save configuration to backend
   */
  saveConfig(teamConfig: TeamConfig): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.apiUrl}/config/save`, teamConfig);
  }

  /**
   * Load configuration from backend
   */
  loadConfig(id: string): Observable<TeamConfig> {
    return this.http.get<TeamConfig>(`${this.apiUrl}/config/${id}`);
  }

  /**
   * Get available templates
   */
  getTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`);
  }

  /**
   * Export team configuration as ZIP
   */
  exportAsZip(payload: {
    teamConfig: TeamConfig;
    sprint?: string;
    raci?: string;
    adr?: string;
  }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/zip`, payload, {
      responseType: 'blob',
    });
  }

  /**
   * Download the exported file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Reset the team configuration
   */
  resetConfig(): void {
    this.teamConfigSubject.next({
      projectName: '',
      projectType: 'new',
      agents: [],
      features: [],
      githubProjectUrl: '',
    });
  }

  /**
   * Check if configuration is complete
   */
  isConfigComplete(): boolean {
    const config = this.teamConfigSubject.value;
    return !!(
      config.projectName &&
      config.agents &&
      config.agents.length > 0 &&
      config.features &&
      config.features.length > 0
    );
  }

  /**
   * Get all projects for a user
   */
  getUserProjects(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/config/user/${userId}`);
  }

  /**
   * Delete a project
   */
  deleteProject(projectId: string, userId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/config/${projectId}?userId=${userId}`);
  }

  /**
   * Update project status
   */
  updateProjectStatus(projectId: string, userId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/config/${projectId}`, { userId, status });
  }
}
