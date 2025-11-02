import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-organization-setup',
  templateUrl: './organization-setup.component.html',
  styleUrls: ['./organization-setup.component.css'],
  standalone: false
})
export class OrganizationSetupComponent implements OnInit {
  organizationForm!: FormGroup;
  saving = false;
  isNewOrganization = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingOrganization();
  }

  private initializeForm(): void {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      industry: ['', Validators.required],
      size: ['', Validators.required],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  private loadExistingOrganization(): void {
    // TODO: Load existing organization from localStorage or API
    const savedOrg = localStorage.getItem('organization');
    if (savedOrg) {
      try {
        const orgData = JSON.parse(savedOrg);
        this.organizationForm.patchValue(orgData);
        this.isNewOrganization = false;
      } catch (error) {
        console.error('Error loading organization:', error);
      }
    }
  }

  saveOrganization(): void {
    if (this.organizationForm.valid) {
      this.saving = true;
      
      const organizationData = this.organizationForm.value;
      const isNew = this.isNewOrganization;
      
      // TODO: Replace with actual API call
      // For now, save to localStorage
      localStorage.setItem('organization', JSON.stringify(organizationData));
      
      // Simulate API call
      setTimeout(() => {
        this.saving = false;
        const message = isNew 
          ? 'Organization saved successfully!\n\nYou can now proceed to create teams and add team members.'
          : 'Organization updated successfully!';
        alert(message);
        
        // Mark as no longer new after first save
        this.isNewOrganization = false;
        
        this.router.navigate(['/dashboard']);
      }, 1000);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
