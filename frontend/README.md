# Frontend Setup

The frontend folder structure has been created, but to install the required Angular packages, you first need to initialize an Angular project.

## Required Steps

### 1. Initialize Angular Project
```bash
cd frontend
npx @angular/cli@latest new . --skip-install
```

### 2. Install Required Packages
Once the Angular project is initialized, install these packages:

```bash
npm install @angular/material @ngx-translate/core @ngx-translate/http-loader
```

## Project Structure

The following module folders have been created:

```
src/app/
├── pages/
│   ├── team-setup/
│   ├── feature-setup/
│   ├── sprint-planning/
│   ├── raci/
│   ├── adr/
│   └── export/
├── services/
└── shared/
```

## Notes

- The frontend structure is ready for Angular module implementation
- Each page folder can contain its component, template, and styles
- The services folder will contain shared services
- The shared folder will contain shared components, pipes, and directives
