import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  username = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.username.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.loading = true;

    this.http.post(
      'http://localhost:3000/api/auth/register',
      {
        username: this.username.trim(),
        password: this.password
      }
    ).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account created successfully.';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 800);
      },

      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Unable to create account.';
      }
    });
  }
}