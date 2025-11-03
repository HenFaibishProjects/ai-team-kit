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
   // Since authentication is removed, always show the toolbar
   // Just hide it on auth pages (even though they're not used anymore)
   const currentUrl$ = this.router.events.pipe(
     filter((event): event is NavigationEnd => event instanceof NavigationEnd),
     map((event: NavigationEnd) => event.url),
     startWith(this.router.url) // Start with current URL
   );


   // Show toolbar on all pages except auth pages
   this.showToolbar$ = currentUrl$.pipe(
     map((url) => {
       // Hide toolbar on login, register, and verify-email pages (legacy)
       const authPages = ['/login', '/register', '/verify-email'];
       const isAuthPage = authPages.some(page => url.startsWith(page));


       // Show toolbar on all pages except auth pages
       return !isAuthPage;
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
