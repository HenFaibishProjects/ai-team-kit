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
  private apiUrl = '/api/github';
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
