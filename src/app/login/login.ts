import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({
      username: this.username,
      password: this.password,
    }).subscribe({
      next: (response: any) => {
        this.loading = false;

        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));

        if (response.user?.is_admin) {
          this.router.navigate(['/admin-books']);
        } else {
          this.router.navigate(['/discover']);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Login failed. Check your username and password.';
      },
    });
  }
}