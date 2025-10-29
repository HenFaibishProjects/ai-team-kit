import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  isSuccess = false;
  errorMessage = '';
  countdown = 5;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isVerifying = false;
      this.errorMessage = 'Invalid verification link. No token provided.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isVerifying = false;
        this.isSuccess = true;
        this.startCountdown();
      },
      error: (error) => {
        this.isVerifying = false;
        this.errorMessage = error.error?.message || 'Email verification failed. The link may be invalid or expired.';
      }
    });
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
