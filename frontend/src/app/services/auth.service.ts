import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  organizationName: string;
  intendedUse: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  organizationName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      this.loadUserProfile();
    }
  }

  register(data: RegisterData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, data);
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.apiUrl}/verify?token=${token}`);
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.apiUrl}/logout`, {}, { headers }).subscribe();
    }
    this.removeToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<User> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  private loadUserProfile(): void {
    this.getProfile().subscribe({
      error: () => {
        // If profile load fails, clear token
        this.removeToken();
        this.currentUserSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
