import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | string;
  is_admin: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private authUrl = `${API_BASE_URL}/auth`;

  signup(data: RegisterRequest): Observable<{ id: number; username: string; email: string }> {
    return this.http.post<{ id: number; username: string; email: string }>(
      `${this.authUrl}/signup/`,
      data
    );
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login/`, data).pipe(
      tap((response) => {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('username', response.user?.username || data.username);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  getUserName(): string {
    return localStorage.getItem('username') || 'Book Lover';
  }

  isAdmin(): boolean {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).is_admin === true : false;
  }
}
