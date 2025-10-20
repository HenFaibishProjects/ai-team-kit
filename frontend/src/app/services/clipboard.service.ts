import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  constructor(private snackBar: MatSnackBar) {}

  async copyToClipboard(text: string, successMessage: string = 'Copied to clipboard!'): Promise<boolean> {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        this.showSuccess(successMessage);
        return true;
      } else {
        // Fallback for older browsers or non-secure contexts
        return this.fallbackCopy(text, successMessage);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showError('Failed to copy to clipboard');
      return false;
    }
  }

  private fallbackCopy(text: string, successMessage: string): boolean {
    try {
      // Create temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      
      // Select and copy
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textarea);
      
      if (successful) {
        this.showSuccess(successMessage);
        return true;
      } else {
        this.showError('Failed to copy to clipboard');
        return false;
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.showError('Failed to copy to clipboard');
      return false;
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
