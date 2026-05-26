import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

type SignupFieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
};

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  email = signal('');
  password = signal('');

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  fieldErrors = signal<SignupFieldErrors>({});

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.fieldErrors.set({});

    if (!this.username() || !this.email() || !this.password()) {
      this.errorMessage.set('Please fill all fields.');
      return;
    }

    if (this.password().length < 6) {
      this.fieldErrors.set({
        password: 'Password must be at least 6 characters.',
      });
      return;
    }

    this.loading.set(true);

    this.authService
      .signup({
        username: this.username(),
        email: this.email(),
        password: this.password(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Account created. Redirecting to login...');

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 700);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.handleSignupError(error);
        },
      });
  }

  clearFieldError(field: keyof SignupFieldErrors): void {
    this.fieldErrors.update((errors) => ({
      ...errors,
      [field]: undefined,
    }));

    this.errorMessage.set('');
  }

  private handleSignupError(error: HttpErrorResponse): void {
    const response = error.error;
    const errors: SignupFieldErrors = {};

    if (response?.username) {
      const message = this.getFirstError(response.username);
      errors.username = message.toLowerCase().includes('exists')
        ? 'This username is already taken. Choose another username.'
        : message;
    }

    if (response?.email) {
      const message = this.getFirstError(response.email);
      errors.email = message.toLowerCase().includes('exists')
        ? 'This email is already registered. Login instead.'
        : message;
    }

    if (response?.password) {
      errors.password = this.getFirstError(response.password);
    }

    this.fieldErrors.set(errors);

    if (response?.detail) {
      this.errorMessage.set(response.detail);
    }

    if (!errors.username && !errors.email && !errors.password && !response?.detail) {
      this.errorMessage.set('Signup failed. Try another username or check your details.');
    }
  }

  private getFirstError(value: unknown): string {
    if (Array.isArray(value)) {
      return String(value[0]);
    }

    return String(value);
  }
}