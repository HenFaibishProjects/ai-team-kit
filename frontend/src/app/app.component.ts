import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { Observable, combineLatest, map, filter, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from './shared/help-dialog/help-dialog.component';


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
   private router: Router,
   private dialog: MatDialog
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

 async openHelpDialog(guideType: 'team-members' | 'start-project' | 'view-projects' | 'ai-center') {
   let component: any;
   let title: string;

   switch (guideType) {
     case 'team-members':
       const { HelpTeamMembersComponent } = await import('./pages/help-team-members/help-team-members.component');
       component = HelpTeamMembersComponent;
       title = 'How to Add Team Members';
       break;
     case 'start-project':
       const { HelpStartProjectComponent } = await import('./pages/help-start-project/help-start-project.component');
       component = HelpStartProjectComponent;
       title = 'How to Start a New Project';
       break;
     case 'view-projects':
       const { HelpViewProjectsComponent } = await import('./pages/help-view-projects/help-view-projects.component');
       component = HelpViewProjectsComponent;
       title = 'How to View All Projects';
       break;
     case 'ai-center':
       const { AiCenterGuideComponent } = await import('./pages/ai-center-guide/ai-center-guide.component');
       component = AiCenterGuideComponent;
       title = 'AI Command Center Guide';
       break;
   }

   this.dialog.open(HelpDialogComponent, {
     data: { component, title },
     width: '90vw',
     maxWidth: '1400px',
     height: '90vh',
     panelClass: 'help-dialog-panel'
   });
 }

 openAiCenterGuide() {
   this.openHelpDialog('ai-center');
 }
}
