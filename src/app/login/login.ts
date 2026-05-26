import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
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
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Please enter username and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login({
        username: this.username.trim(),
        password: this.password,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.user?.is_admin) {
            this.router.navigate(['/admin-books']);
          } else {
            this.router.navigate(['/discover']);
          }
        },
        error: (error) => {
          console.log('LOGIN ERROR:', error);
          this.errorMessage = 'Login failed. Check your username and password.';
        },
      });
  }
}
