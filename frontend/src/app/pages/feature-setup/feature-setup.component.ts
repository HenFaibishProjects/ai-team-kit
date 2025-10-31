import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { GithubService, GitHubRepository, RepositoryDetails } from '../../services/github.service';
import type { FeatureConfig } from '../../../../../shared/types';

@Component({
  selector: 'app-feature-setup',
  templateUrl: './feature-setup.component.html',
  styleUrls: ['./feature-setup.component.css'],
  standalone: false
})
export class FeatureSetupComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  featureForm: FormGroup;
  projectType: 'new' | 'existing' | null = null;
  githubProjectUrl: string = '';

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
    private githubService: GithubService
  ) {
    this.featureForm = this.fb.group({
      features: this.fb.array([])
    });
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
      // For new projects, show GitHub URL input
      // Don't add feature yet - wait for URL confirmation
    } else {
      // For existing projects, show GitHub authentication
      this.showGithubAuth = true;
    }
  }

  confirmGithubUrl(): void {
    if (this.githubProjectUrl.trim()) {
      this.teamService.setGithubProjectUrl(this.githubProjectUrl);
      this.addFeature();
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
      error: () => {
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
      error: () => {
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
      },
      error: () => {
        alert('Failed to load repository details');
        this.loadingDetails = false;
      },
    });
  }

  /**
   * Confirm repository selection and continue
   */
  confirmRepository(): void {
    if (this.selectedRepository) {
      this.teamService.setGithubProjectUrl(this.selectedRepository.html_url);
      this.githubProjectUrl = this.selectedRepository.html_url;
      this.addFeature();
    }
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

  onBack(): void {
    this.back.emit();
  }
}
