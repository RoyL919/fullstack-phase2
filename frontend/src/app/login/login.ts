import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';

    // Remove accidental spaces from username
    this.username = this.username.trim();
    
    // Required fields
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter a username and password.';
      return;
    }

    // Username length
    if (this.username.length < 3 || this.username.length > 20) {
      this.errorMessage =
        'Username must be between 3 and 20 characters.';
      return;
    }

    // Username characters
    if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      this.errorMessage =
        'Username can only contain letters, numbers and underscores.';
      return;
    }

    // Password length
    if (this.password.length < 6) {
      this.errorMessage =
        'Password must be at least 6 characters.';
      return;
    }

    this.auth.login(this.username, this.password).subscribe({
      next: (response) => {
        this.auth.saveUser(response.user);
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Unable to login. Please try again.';
      }
    });
  }
}