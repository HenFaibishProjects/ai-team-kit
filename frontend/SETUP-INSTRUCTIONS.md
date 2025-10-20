# Frontend Setup Instructions

The frontend structure and Team Setup page have been created, but Angular needs to be initialized before the app can run.

## Important: Node.js Version Requirement

**You must use an LTS version of Node.js (v20.x or v22.x).**

Your current version is v21.7.3 (odd-numbered), which causes ESM compatibility issues with Angular CLI.

### Switch to Node.js LTS:

```bash
# If using nvm:
nvm install 20
nvm use 20

# Verify version
node --version  # Should show v20.x.x
```

After switching to Node.js 20, proceed with the steps below.

## Step 1: Initialize Angular Project

**IMPORTANT: You MUST complete this step first before running `ng serve`**

```bash
cd frontend
npx @angular/cli@latest new . --skip-install --routing=true --style=css
```

When prompted:
- Select **No** for Angular analytics (or your preference)
- This will create the Angular project structure in the current directory (angular.json, etc.)

**Note**: If you see a warning about existing files, type `y` to proceed. The Angular CLI will merge with existing files.

## Step 2: Install Required Packages

```bash
npm install
# Install Angular Material with matching version
npm install @angular/material@^18.0.0 @angular/cdk@^18.0.0 @ngx-translate/core @ngx-translate/http-loader
```

**Note**: If you see version conflicts, use `--legacy-peer-deps`:
```bash
npm install @angular/material@^18.0.0 @angular/cdk@^18.0.0 @ngx-translate/core @ngx-translate/http-loader --legacy-peer-deps
```

## Step 3: Configure Angular Material

Add Angular Material to your project:

```bash
ng add @angular/material
```

Choose a theme (e.g., Indigo/Pink) and answer yes to typography and animations.

## Step 4: Update app.module.ts

Import the required modules:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamSetupComponent } from './pages/team-setup/team-setup.component';

@NgModule({
  declarations: [
    AppComponent,
    TeamSetupComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Step 5: Configure Routes

Update `app-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamSetupComponent } from './pages/team-setup/team-setup.component';

const routes: Routes = [
  { path: '', redirectTo: '/team-setup', pathMatch: 'full' },
  { path: 'team-setup', component: TeamSetupComponent },
  // Add other routes as you create the components
  // { path: 'feature-setup', component: FeatureSetupComponent },
  // { path: 'sprint-planning', component: SprintPlanningComponent },
  // { path: 'raci', component: RaciComponent },
  // { path: 'adr', component: AdrComponent },
  // { path: 'export', component: ExportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## Step 6: Update app.component.html

Replace the content with:

```html
<router-outlet></router-outlet>
```

## Step 7: Configure Backend URL

Update the API URL in `src/app/services/team.service.ts` if your backend runs on a different port:

```typescript
private apiUrl = 'http://localhost:3000'; // Update if needed
```

## Step 8: Start the Development Server

```bash
npm start
```

The app should now be running at `http://localhost:4200`

## Project Structure

```
frontend/src/app/
├── pages/
│   ├── team-setup/              ✓ Created
│   │   ├── team-setup.component.ts
│   │   ├── team-setup.component.html
│   │   └── team-setup.component.css
│   ├── feature-setup/           (To be created)
│   ├── sprint-planning/         (To be created)
│   ├── raci/                    (To be created)
│   ├── adr/                     (To be created)
│   └── export/                  (To be created)
├── services/
│   └── team.service.ts          ✓ Created
└── shared/                      (For shared components/pipes/directives)
```

## Features Implemented

### Team Setup Page
- Project name input
- Dynamic agent/team member forms
- Role selection (7 predefined roles)
- Strengths and constraints (dynamic arrays)
- Preference sliders (1-10 scale) for:
  - Cost Sensitivity
  - Security Rigidity
  - Maintainability
  - Performance
- Add/remove team members
- Form validation
- Responsive design

### Team Service
- State management with RxJS BehaviorSubject
- HTTP methods for backend communication:
  - Save configuration
  - Load configuration
  - Get templates
  - Export as ZIP
- Helper methods for file download
- Configuration validation

## Next Steps

1. Create the remaining page components (feature-setup, sprint-planning, etc.)
2. Implement navigation between wizard steps
3. Add internationalization with @ngx-translate
4. Add loading states and error handling
5. Implement the export page with template selection
6. Add unit tests

## Backend Integration

The frontend is configured to communicate with the backend at `http://localhost:3000`. Make sure the backend is running:

```bash
cd backend
npm run start:dev
```

Available backend endpoints:
- `GET /health` - Health check
- `POST /config/save` - Save team configuration
- `GET /config/:id` - Load team configuration
- `GET /templates` - List available templates
- `POST /export/zip` - Export configuration as ZIP
