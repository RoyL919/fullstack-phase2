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

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter a username and password.';
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