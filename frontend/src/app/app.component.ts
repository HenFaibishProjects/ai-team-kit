import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { Observable, combineLatest, map, filter, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent {
  title = 'Virtual Team Kit';
  isDarkMode$ = this.themeService.darkMode$;

  // Observable to determine if toolbar should be shown
  showToolbar$: Observable<boolean>;

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    // Get current route URL observable
    const currentUrl$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url),
      startWith(this.router.url) // Start with current URL
    );

    // Combine authentication state and current route to determine if toolbar should be shown
    this.showToolbar$ = combineLatest([
      this.authService.currentUser$,
      currentUrl$
    ]).pipe(
      map(([user, url]) => {
        // Hide toolbar on login, register, and verify-email pages
        const authPages = ['/login', '/register', '/verify-email'];
        const isAuthPage = authPages.some(page => url.startsWith(page));

        // Show toolbar only if user is authenticated and not on auth pages
        return !!user && !isAuthPage;
      })
    );
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout();
  }
}
