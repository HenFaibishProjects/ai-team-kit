import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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

import { AppComponent } from './app.component';
import { WizardComponent } from './pages/wizard/wizard.component';
import { TeamSetupComponent } from './pages/team-setup/team-setup.component';
import { FeatureSetupComponent } from './pages/feature-setup/feature-setup.component';
import { FeaturePlanningComponent } from './pages/sprint-planning/sprint-planning.component';
import { RaciComponent } from './pages/raci/raci.component';
import { AdrComponent } from './pages/adr/adr.component';
import { ExportComponent } from './pages/export/export.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { OrganizationSetupComponent } from './pages/organization-setup/organization-setup.component';
import { TeamManagementComponent } from './pages/team-management/team-management.component';
import { ProjectDetailsComponent } from './pages/project-details/project-details.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'organization/setup', component: OrganizationSetupComponent, canActivate: [AuthGuard] },
  { path: 'teams/manage', component: TeamManagementComponent, canActivate: [AuthGuard] },
  { path: 'wizard', component: WizardComponent, canActivate: [AuthGuard] },
  { path: 'project-details', component: ProjectDetailsComponent, canActivate: [AuthGuard] },
  { path: 'sprint-planning', component: FeaturePlanningComponent, canActivate: [AuthGuard] },
  { path: 'raci', component: RaciComponent, canActivate: [AuthGuard] },
  { path: 'export', component: ExportComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    WizardComponent,
    TeamSetupComponent,
    FeatureSetupComponent,
    FeaturePlanningComponent,
    RaciComponent,
    AdrComponent,
    ExportComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    VerifyEmailComponent,
    OrganizationSetupComponent,
    TeamManagementComponent,
    ProjectDetailsComponent
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
    MatTooltipModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
