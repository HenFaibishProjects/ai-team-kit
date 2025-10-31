import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { GithubService, GitHubRepository, RepositoryDetails } from '../../services/github.service';
import type { FeatureConfig, Agent } from '../../../../../shared/types';

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

  // Team members for assignment
  teamMembers: Agent[] = [];

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

    // Load team members for assignment
    this.teamMembers = this.teamService.getAgents();
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

  /**
   * Skip GitHub linking and continue without repository
   */
  skipGithubLinking(): void {
    this.githubProjectUrl = 'N/A';
    this.teamService.setGithubProjectUrl('');
    this.addFeature();
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
      error: (error) => {
        console.error('GitHub connection error:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to connect to GitHub';
        alert(`Failed to connect to GitHub: ${errorMessage}\n\nPlease check:\n- Token is valid and not expired\n- Token has 'repo' scope\n- You're using a classic token or fine-grained token with repository permissions`);
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
        console.error('Failed to load repositories:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to load repositories';
        alert(`Failed to load repositories: ${errorMessage}`);
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
      error: (error) => {
        console.error('Failed to load repository details:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to load repository details';
        alert(`Failed to load repository details: ${errorMessage}`);
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
      acceptanceCriteria: this.fb.array([this.fb.control('', Validators.required)]),
      assignedTo: [[] as string[]] // Array of agent IDs
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

  /**
   * Toggle agent assignment for a feature
   */
  toggleAgentAssignment(featureIndex: number, agentId: string): void {
    const feature = this.features.at(featureIndex);
    const assignedTo = feature.get('assignedTo')?.value as string[] || [];
    
    const index = assignedTo.indexOf(agentId);
    if (index > -1) {
      // Remove agent
      assignedTo.splice(index, 1);
    } else {
      // Add agent
      assignedTo.push(agentId);
    }
    
    feature.patchValue({ assignedTo });
  }

  /**
   * Check if agent is assigned to feature
   */
  isAgentAssigned(featureIndex: number, agentId: string): boolean {
    const feature = this.features.at(featureIndex);
    const assignedTo = feature.get('assignedTo')?.value as string[] || [];
    return assignedTo.includes(agentId);
  }

  /**
   * Get assigned agents for a feature
   */
  getAssignedAgents(featureIndex: number): Agent[] {
    const feature = this.features.at(featureIndex);
    const assignedTo = feature.get('assignedTo')?.value as string[] || [];
    return this.teamMembers.filter(agent => assignedTo.includes(agent.id));
  }

  /**
   * Format agent orientation for display
   */
  formatOrientation(orientation: string): string {
    return orientation.replace(/_/g, ' ');
  }

  /**
   * Get assigned agents names as comma-separated string
   */
  getAssignedAgentsNames(featureIndex: number): string {
    const agents = this.getAssignedAgents(featureIndex);
    return agents.map(a => a.name).join(', ');
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
