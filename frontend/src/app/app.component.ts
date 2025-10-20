import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent {
  title = 'AI Team Kit';
  isDarkMode$ = this.themeService.darkMode$;

  constructor(public themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }
}
