import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-help-start-project',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatStepperModule,
    MatCheckboxModule
  ],
  templateUrl: './help-start-project.component.html',
  styleUrl: './help-start-project.component.css'
})
export class HelpStartProjectComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
