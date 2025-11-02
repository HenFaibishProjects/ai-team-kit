import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppComponent } from './app.component';
import { WizardComponent, ExitWizardDialogComponent } from './pages/wizard/wizard.component';
import { TeamSetupComponent } from './pages/team-setup/team-setup.component';
import { FeatureSetupComponent } from './pages/feature-setup/feature-setup.component';
import { FeaturePlanningComponent } from './pages/sprint-planning/sprint-planning.component';
import { RaciComponent } from './pages/raci/raci.component';
import { AdrComponent } from './pages/adr/adr.component';
import { ExportComponent } from './pages/export/export.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationSetupComponent } from './pages/organization-setup/organization-setup.component';
import { TeamManagementComponent } from './pages/team-management/team-management.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { UserProjectsComponent } from './pages/user-projects/user-projects.component';
import {MatMenuModule} from "@angular/material/menu";

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'organization/setup', component: OrganizationSetupComponent },
  { path: 'teams/manage', component: TeamManagementComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'user-projects', component: UserProjectsComponent },
  { path: 'wizard', component: WizardComponent },
  { path: 'project-details', component: ProjectDetailsComponent },
  { path: 'sprint-planning', component: FeaturePlanningComponent },
  { path: 'raci', component: RaciComponent },
  { path: 'export', component: ExportComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    WizardComponent,
    ExitWizardDialogComponent,
    TeamSetupComponent,
    FeatureSetupComponent,
    FeaturePlanningComponent,
    RaciComponent,
    AdrComponent,
    ExportComponent,
    DashboardComponent,
    OrganizationSetupComponent,
    TeamManagementComponent,
    ProjectDetailsComponent,
    ProjectsComponent,
    UserProjectsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSliderModule,
    MatStepperModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressBarModule,
    MatMenuModule  // ADD THIS LINE
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
