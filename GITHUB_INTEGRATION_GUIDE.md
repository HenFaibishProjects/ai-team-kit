# GitHub Integration Implementation Guide

This document provides a complete implementation guide for integrating GitHub API into the Virtual Team Kit project.

## Overview

The GitHub integration will allow users to:
1. **New Projects**: Get instructions to create a GitHub repository
2. **Existing Projects**: Connect via Personal Access Token and automatically fetch repository data

## Prerequisites

- GitHub Personal Access Token with `repo` scope
- NestJS backend with HttpModule
- Angular frontend with HttpClient

---

## Phase 1: Backend Implementation

### 1.1 Install Dependencies

```bash
cd backend
npm install @octokit/rest
```

### 1.2 Create GitHub Module

**File: `backend/src/modules/github/github.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';

@Module({
  imports: [HttpModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
```

### 1.3 Create GitHub Service

**File: `backend/src/modules/github/github.service.ts`**

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  /**
   * Verify GitHub token and get user info
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.users.getAuthenticated();
      return {
        success: true,
        user: {
          login: data.login,
          name: data.name,
          email: data.email,
          avatar_url: data.avatar_url,
        },
      };
    } catch (error) {
      throw new HttpException(
        'Invalid GitHub token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(token: string): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        language: repo.language,
        default_branch: repo.default_branch,
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch repositories',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get repository details
   */
  async getRepositoryDetails(
    token: string,
    owner: string,
    repo: string,
  ): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });

      // Get repository info
      const { data: repoData } = await octokit.repos.get({ owner, repo });

      // Get repository structure (root directory)
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path: '',
      });

      // Get recent commits
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 10,
      });

      // Get languages
      const { data: languages } = await octokit.repos.listLanguages({
        owner,
        repo,
      });

      // Get contributors
      const { data: contributors } = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 10,
      });

      return {
        repository: {
          id: repoData.id,
          name: repoData.name,
          full_name: repoData.full_name,
          description: repoData.description,
          private: repoData.private,
          html_url: repoData.html_url,
          created_at: repoData.created_at,
          updated_at: repoData.updated_at,
          language: repoData.language,
          default_branch: repoData.default_branch,
          size: repoData.size,
          stargazers_count: repoData.stargazers_count,
          watchers_count: repoData.watchers_count,
          forks_count: repoData.forks_count,
          open_issues_count: repoData.open_issues_count,
        },
        structure: Array.isArray(contents)
          ? contents.map((item) => ({
              name: item.name,
              path: item.path,
              type: item.type,
              size: item.size,
            }))
          : [],
        commits: commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
        })),
        languages,
        contributors: contributors.map((contributor) => ({
          login: contributor.login,
          contributions: contributor.contributions,
          avatar_url: contributor.avatar_url,
        })),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch repository details',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get directory structure recursively
   */
  async getDirectoryStructure(
    token: string,
    owner: string,
    repo: string,
    path: string = '',
  ): Promise<any> {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.repos.getContent({ owner, repo, path });

      if (Array.isArray(data)) {
        return data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
        }));
      }

      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch directory structure',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Parse repository URL to extract owner and repo name
   */
  parseGithubUrl(url: string): { owner: string; repo: string } | null {
    const regex =
      /github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)(\.git)?/;
    const match = url.match(regex);

    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }

    return null;
  }
}
```

### 1.4 Create GitHub Controller

**File: `backend/src/modules/github/github.controller.ts`**

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('verify-token')
  async verifyToken(@Body('token') token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    return this.githubService.verifyToken(token);
  }

  @Get('repositories')
  async getRepositories(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    return this.githubService.getUserRepositories(token);
  }

  @Get('repository-details')
  async getRepositoryDetails(
    @Query('token') token: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
  ) {
    if (!token || !owner || !repo) {
      throw new HttpException(
        'Token, owner, and repo are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.githubService.getRepositoryDetails(token, owner, repo);
  }

  @Get('directory-structure')
  async getDirectoryStructure(
    @Query('token') token: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('path') path?: string,
  ) {
    if (!token || !owner || !repo) {
      throw new HttpException(
        'Token, owner, and repo are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.githubService.getDirectoryStructure(
      token,
      owner,
      repo,
      path || '',
    );
  }

  @Post('parse-url')
  async parseUrl(@Body('url') url: string) {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }
    const parsed = this.githubService.parseGithubUrl(url);
    if (!parsed) {
      throw new HttpException('Invalid GitHub URL', HttpStatus.BAD_REQUEST);
    }
    return parsed;
  }
}
```

### 1.5 Register GitHub Module in App Module

**File: `backend/src/app.module.ts`**

```typescript
import { GithubModule } from './modules/github/github.module';

@Module({
  imports: [
    // ... other imports
    GithubModule,
  ],
  // ...
})
export class AppModule {}
```

---

## Phase 2: Frontend Implementation

### 2.1 Create GitHub Service

**File: `frontend/src/app/services/github.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface GitHubUser {
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  language: string;
  default_branch: string;
}

export interface RepositoryDetails {
  repository: any;
  structure: any[];
  commits: any[];
  languages: any;
  contributors: any[];
}

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private apiUrl = 'http://localhost:3000/github';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<GitHubUser | null>(null);

  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load token from localStorage if exists
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      this.tokenSubject.next(savedToken);
    }
  }

  /**
   * Verify and save GitHub token
   */
  verifyToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-token`, { token }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.tokenSubject.next(token);
          this.userSubject.next(response.user);
          localStorage.setItem('github_token', token);
        }
      })
    );
  }

  /**
   * Get user's repositories
   */
  getRepositories(): Observable<GitHubRepository[]> {
    const token = this.tokenSubject.value;
    if (!token) {
      throw new Error('No GitHub token available');
    }

    const params = new HttpParams().set('token', token);
    return this.http.get<GitHubRepository[]>(`${this.apiUrl}/repositories`, {
      params,
    });
  }

  /**
   * Get repository details
   */
  getRepositoryDetails(owner: string, repo: string): Observable<RepositoryDetails> {
    const token = this.tokenSubject.value;
    if (!token) {
      throw new Error('No GitHub token available');
    }

    const params = new HttpParams()
      .set('token', token)
      .set('owner', owner)
      .set('repo', repo);

    return this.http.get<RepositoryDetails>(`${this.apiUrl}/repository-details`, {
      params,
    });
  }

  /**
   * Get directory structure
   */
  getDirectoryStructure(
    owner: string,
    repo: string,
    path: string = ''
  ): Observable<any> {
    const token = this.tokenSubject.value;
    if (!token) {
      throw new Error('No GitHub token available');
    }

    let params = new HttpParams()
      .set('token', token)
      .set('owner', owner)
      .set('repo', repo);

    if (path) {
      params = params.set('path', path);
    }

    return this.http.get(`${this.apiUrl}/directory-structure`, { params });
  }

  /**
   * Parse GitHub URL
   */
  parseGithubUrl(url: string): Observable<{ owner: string; repo: string }> {
    return this.http.post<{ owner: string; repo: string }>(
      `${this.apiUrl}/parse-url`,
      { url }
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get current user
   */
  getUser(): GitHubUser | null {
    return this.userSubject.value;
  }

  /**
   * Logout (clear token)
   */
  logout(): void {
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    localStorage.removeItem('github_token');
  }
}
```

### 2.2 Update Feature Setup Component

**File: `frontend/src/app/pages/feature-setup/feature-setup.component.ts`**

Add these properties and methods:

```typescript
import { GithubService, GitHubRepository, RepositoryDetails } from '../../services/github.service';

export class FeatureSetupComponent implements OnInit {
  // ... existing properties

  // GitHub integration properties
  showGithubAuth = false;
  githubToken = '';
  githubConnected = false;
  githubUser: any = null;
  repositories: GitHubRepository[] = [];
  selectedRepository: GitHubRepository | null = null;
  repositoryDetails: RepositoryDetails | null = null;
  loadingRepositories = false;
  loadingDetails = false;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private githubService: GithubService // Add this
  ) {
    // ... existing constructor code
  }

  ngOnInit(): void {
    // Check if already connected to GitHub
    if (this.githubService.isAuthenticated()) {
      this.githubConnected = true;
      this.githubUser = this.githubService.getUser();
    }
  }

  selectProjectType(type: 'new' | 'existing'): void {
    this.projectType = type;
    this.teamService.setProjectType(type);

    if (type === 'new') {
      // Show instructions for new project
      this.addFeature();
    } else {
      // Show GitHub authentication for existing project
      this.showGithubAuth = true;
    }
  }

  /**
   * Connect to GitHub with Personal Access Token
   */
  connectGithub(): void {
    if (!this.githubToken.trim()) {
      return;
    }

    this.loadingRepositories = true;
    this.githubService.verifyToken(this.githubToken).subscribe({
      next: (response) => {
        this.githubConnected = true;
        this.githubUser = response.user;
        this.loadRepositories();
      },
      error: (error) => {
        alert('Failed to connect to GitHub. Please check your token.');
        this.loadingRepositories = false;
      },
    });
  }

  /**
   * Load user's repositories
   */
  loadRepositories(): void {
    this.loadingRepositories = true;
    this.githubService.getRepositories().subscribe({
      next: (repos) => {
        this.repositories = repos;
        this.loadingRepositories = false;
      },
      error: (error) => {
        alert('Failed to load repositories');
        this.loadingRepositories = false;
      },
    });
  }

  /**
   * Select a repository
   */
  selectRepository(repo: GitHubRepository): void {
    this.selectedRepository = repo;
    this.loadRepositoryDetails(repo);
  }

  /**
   * Load repository details
   */
  loadRepositoryDetails(repo: GitHubRepository): void {
    this.loadingDetails = true;
    const [owner, repoName] = repo.full_name.split('/');

    this.githubService.getRepositoryDetails(owner, repoName).subscribe({
      next: (details) => {
        this.repositoryDetails = details;
        this.loadingDetails = false;

        // Auto-populate project data
        this.teamService.setGithubProjectUrl(repo.html_url);
        
        // Add feature based on repository
        this.addFeature();
      },
      error: (error) => {
        alert('Failed to load repository details');
        this.loadingDetails = false;
      },
    });
  }

  /**
   * Disconnect from GitHub
   */
  disconnectGithub(): void {
    this.githubService.logout();
    this.githubConnected = false;
    this.githubUser = null;
    this.repositories = [];
    this.selectedRepository = null;
    this.repositoryDetails = null;
    this.githubToken = '';
  }

  // ... rest of existing methods
}
```

### 2.3 Update Feature Setup Template

**File: `frontend/src/app/pages/feature-setup/feature-setup.component.html`**

Replace the existing project type selection section with:

```html
<!-- Project Type Selection -->
<div *ngIf="!projectType" class="project-type-selection">
  <h3>Select Project Type</h3>
  
  <div class="type-cards">
    <mat-card class="type-card" (click)="selectProjectType('new')">
      <mat-icon>add_circle</mat-icon>
      <h4>New Project</h4>
      <p>Start a new project from scratch</p>
    </mat-card>

    <mat-card class="type-card" (click)="selectProjectType('existing')">
      <mat-icon>folder_open</mat-icon>
      <h4>Existing Project</h4>
      <p>Connect to an existing GitHub repository</p>
    </mat-card>
  </div>
</div>

<!-- New Project Instructions -->
<div *ngIf="projectType === 'new' && !githubProjectUrl" class="github-instructions">
  <mat-card class="instruction-card">
    <mat-card-header>
      <mat-icon>info</mat-icon>
      <h3>Create GitHub Repository</h3>
    </mat-card-header>
    <mat-card-content>
      <p>Before continuing, please create a new repository on GitHub:</p>
      <ol>
        <li>Go to <a href="https://github.com/new" target="_blank">GitHub</a> and create a new repository</li>
        <li>Choose a name for your repository</li>
        <li>Set it to Public or Private based on your preference</li>
        <li>Initialize with a README (recommended)</li>
        <li>Copy the repository URL</li>
      </ol>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>GitHub Repository URL</mat-label>
        <input matInput [(ngModel)]="githubProjectUrl" placeholder="https://github.com/username/repo">
      </mat-form-field>

      <button mat-raised-button color="primary" 
              (click)="confirmGithubUrl()" 
              [disabled]="!githubProjectUrl">
        Continue
      </button>
    </mat-card-content>
  </mat-card>
</div>

<!-- Existing Project - GitHub Authentication -->
<div *ngIf="projectType === 'existing' && showGithubAuth && !githubConnected" class="github-auth">
  <mat-card class="auth-card">
    <mat-card-header>
      <mat-icon>vpn_key</mat-icon>
      <h3>Connect to GitHub</h3>
    </mat-card-header>
    <mat-card-content>
      <p>To connect to your existing GitHub repository, you need a Personal Access Token:</p>
      
      <div class="token-instructions">
        <h4>How to get your token:</h4>
        <ol>
          <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings → Developer settings → Personal access tokens</a></li>
          <li>Click "Generate new token (classic)"</li>
          <li>Give it a name (e.g., "Virtual Team Kit")</li>
          <li>Select the <strong>repo</strong> scope</li>
          <li>Click "Generate token"</li>
          <li>Copy the token and paste it below</li>
        </ol>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>GitHub Personal Access Token</mat-label>
        <input matInput type="password" [(ngModel)]="githubToken" placeholder="ghp_...">
        <mat-hint>Your token will be stored securely</mat-hint>
      </mat-form-field>

      <div class="auth-actions">
        <button mat-raised-button color="primary" 
                (click)="connectGithub()" 
                [disabled]="!githubToken || loadingRepositories">
          <mat-icon>link</mat-icon>
          Connect to GitHub
        </button>
        <button mat-button (click)="projectType = null">Cancel</button>
      </div>
    </mat-card-content>
  </mat-card>
</div>

<!-- Repository Selection -->
<div *ngIf="projectType === 'existing' && githubConnected && !selectedRepository" class="repository-selection">
  <mat-card class="repos-card">
    <mat-card-header>
      <div class="header-with-user">
        <div>
          <mat-icon>folder_special</mat-icon>
          <h3>Select Repository</h3>
        </div>
        <div class="github-user">
          <img [src]="githubUser?.avatar_url" alt="Avatar">
          <span>{{ githubUser?.login }}</span>
          <button mat-icon-button (click)="disconnectGithub()" matTooltip="Disconnect">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </div>
    </mat-card-header>

    <mat-card-content>
      <div *ngIf="loadingRepositories" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading repositories...</p>
      </div>

      <div *ngIf="!loadingRepositories" class="repositories-list">
        <mat-card *ngFor="let repo of repositories" 
                  class="repo-card" 
                  (click)="selectRepository(repo)">
          <div class="repo-header">
            <h4>{{ repo.name }}</h4>
            <mat-chip [class.private]="repo.private">
              {{ repo.private ? 'Private' : 'Public' }}
            </mat-chip>
          </div>
          <p class="repo-description">{{ repo.description || 'No description' }}</p>
          <div class="repo-meta">
            <span *ngIf="repo.language">
              <mat-icon>code</mat-icon>
              {{ repo.language }}
            </span>
            <span>
              <mat-icon>update</mat-icon>
              Updated {{ repo.updated_at | date:'short' }}
            </span>
          </div>
        </mat-card>
      </div>
    </mat-card-content>
  </mat-card>
</div>

<!-- Repository Details -->
<div *ngIf="selectedRepository && repositoryDetails" class="repository-details">
  <mat-card class="details-card">
    <mat-card-header>
      <mat-icon>info</mat-icon>
      <h3>{{ selectedRepository.name }}</h3>
      <button mat-icon-button (click)="selectedRepository = null; repositoryDetails = null">
        <mat-icon>close</mat-icon>
      </button>
    </mat-card-header>

    <mat-card-content>
      <div class="details-grid">
        <div class="detail-section">
          <h4>Repository Info</h4>
          <p><strong>Description:</strong> {{ repositoryDetails.repository.description || 'N/A' }}</p>
          <p><strong>Language:</strong> {{ repositoryDetails.repository.language || 'N/A' }}</p>
          <p><strong>Size:</strong> {{ repositoryDetails.repository.size }} KB</p>
          <p><strong>Stars:</strong> {{ repositoryDetails.repository.stargazers_count }}</p>
        </div>

        <div class="detail-section">
          <h4>Languages Used</h4>
          <div class="languages">
            <mat-chip *ngFor="let lang of repositoryDetails.languages | keyvalue">
              {{ lang.key }}: {{ lang.value }}
            </mat-chip>
          </div>
        </div>

        <div class="detail-section">
          <h4>Recent Commits ({{ repositoryDetails.commits.length }})</h4>
          <div class="commits-list">
            <div *ngFor="let commit of repositoryDetails.commits" class="commit-item">
              <p class="commit-message">{{ commit.message }}</p>
              <p class="commit-meta">{{ commit.author }} - {{ commit.date | date:'short' }}</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Contributors ({{ repositoryDetails.contributors.length }})</h4>
          <div class="contributors">
            <div *ngFor="let contributor of repositoryDetails.contributors" class="contributor">
              <img [src]="contributor.avatar_url" [alt]="contributor.login">
              <span>{{ contributor.login }} ({{ contributor.contributions }})</span>
            </div>
          </div>
        </div>
      </div>

      <button mat-raised-button color="primary" (click)="confirmRepository()">
        Use This Repository
      </button>
    </mat-card-content>
  </mat-card>
</div>

<!-- Features Form (shown after project type selection) -->
<div *ngIf="(projectType === 'new' && githubProjectUrl) || (projectType === 'existing' && selectedRepository)">
  <!-- Existing features form code -->
</div>
```

### 2.4 Add Styles

**File: `frontend/src/app/pages/feature-setup/feature-setup.component.css`**

Add these styles:

```css
/* GitHub Integration Styles */
.github-instructions,
.github-auth,
.repository-selection,
.repository-details {
  margin: 2rem 0;
}

.instruction-card,
.auth-card,
.repos-card,
.details-card {
  padding: 2rem;
}

.instruction-card mat-icon,
.auth-card mat-icon {
  color: #3f51b5;
  font-size: 2rem;
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
}

.token-instructions {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.token-instructions h4 {
  margin-top: 0;
}

.token-instructions ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.auth-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.header-with-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.github-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.github-user img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.repositories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.repo-card {
  cursor: pointer;
  transition: all 0.2s;
  padding: 1rem;
}

.repo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.repo-header h4 {
  margin: 0;
}

.repo-header mat-chip {
  font-size: 0.75rem;
}

.repo-header mat-chip.private {
  background-color: #ff9800;
  color: white;
}

.repo-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.repo-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #888;
}

.repo-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.repo-meta mat-icon {
  font-size: 1rem;
  width: 1rem;
  height: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.detail-section h4 {
  margin-top: 0;
  color: #3f51b5;
}

.languages {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.commits-list {
  max-height: 300px;
  overflow-y: auto;
}

.commit-item {
  padding: 0.5rem;
  border-left: 3px solid #3f51b5;
  margin-bottom: 0.5rem;
  background: #f5f5f5;
}

.commit-message {
  margin: 0;
  font-weight: 500;
}

.commit-meta {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #666;
}

.contributors {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.contributor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contributor img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}
```

---

## Phase 3: Environment Configuration

### 3.1 Update .env.example

Add to `.env.example`:

```
# GitHub Integration (Optional - for OAuth)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## Phase 4: Testing

### 4.1 Test Backend Endpoints

```bash
# Test token verification
curl -X POST http://localhost:3000/github/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"your_github_token"}'

# Test repository listing
curl "http://localhost:3000/github/repositories?token=your_github_token"

# Test repository details
curl "http://localhost:3000/github/repository-details?token=your_github_token&owner=username&repo=reponame"
```

### 4.2 Test Frontend Flow

1. Start the application
2. Navigate to feature setup
3. Select "Existing Project"
4. Enter GitHub Personal Access Token
5. Select a repository
6. Verify repository details are displayed
7. Continue with feature setup

---

## Phase 5: Documentation

### 5.1 Update README.md

Add section about GitHub integration:

```markdown
## GitHub Integration

### For Existing Projects

1. Generate a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select the `repo` scope
   - Copy the generated token

2. In the application:
   - Select "Existing Project"
   - Enter your Personal Access Token
   - Select your repository
   - The system will automatically fetch project details

### For New Projects

1. Create a new repository on GitHub
2. Copy the repository URL
3. Paste it in the application when prompted
4. Continue with project setup

### Security Notes

- Tokens are stored in browser localStorage
- Never commit tokens to version control
- Tokens can be revoked at any time from GitHub settings
```

---

## Implementation Checklist

- [ ] Install @octokit/rest in backend
- [ ] Create GitHub module, service, and controller
- [ ] Register GitHub module in app.module.ts
- [ ] Create GitHub service in frontend
- [ ] Update feature-setup component TypeScript
- [ ] Update feature-setup component HTML
- [ ] Update feature-setup component CSS
- [ ] Test backend endpoints
- [ ] Test frontend flow
- [ ] Update documentation
- [ ] Commit and push changes

---

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. For production, consider using more secure storage.
2. **Token Expiration**: Implement token refresh logic if needed.
3. **Rate Limiting**: GitHub API has rate limits. Implement caching if needed.
4. **Error Handling**: Add comprehensive error handling for API failures.
5. **CORS**: Ensure backend CORS settings allow frontend requests.

---

## Future Enhancements

1. **OAuth Flow**: Implement full OAuth flow instead of Personal Access Token
2. **Webhook Integration**: Listen to GitHub webhooks for real-time updates
3. **Branch Selection**: Allow users to select specific branches
4. **File Preview**: Show file contents from repository
5. **Commit History**: Display full commit history with filtering
6. **Pull Request Integration**: Show open PRs and their status

---

## Troubleshooting

### Common Issues

1. **"Invalid GitHub token"**
   - Verify token has `repo` scope
   - Check token hasn't expired
   - Ensure token is correctly copied

2. **"Failed to fetch repositories"**
   - Check network connection
   - Verify backend is running
   - Check CORS settings

3. **"Repository details not loading"**
   - Verify repository exists and is accessible
   - Check token permissions
   - Review backend logs for errors

---

## Support

For issues or questions:
1. Check GitHub API documentation: https://docs.github.com/en/rest
2. Review Octokit documentation: https://github.com/octokit/rest.js
3. Open an issue in the project repository
