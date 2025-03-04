import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserLoginDto } from '../dto/user-login.dto';
import { tap, Observable, BehaviorSubject } from 'rxjs';
import { LoginResponseDto } from '../dto/login-response.dto';
import { jwtDecode } from 'jwt-decode';
import { UserRegistrationDto } from '../dto/user-registration.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserUpdateDtoAdmin } from '../dto/user-update-dto-admin';
import { UserChangePasswordDto } from '../dto/user-change-password.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private token: string | null = null;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.isAuthenticated()
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  changePassword(
    userId: number,
    userChangePasswordDto: UserChangePasswordDto
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${userId}/change-password`,
      userChangePasswordDto
    );
  }

  login(userLoginDto: UserLoginDto): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${this.apiUrl}/login`, userLoginDto)
      .pipe(
        tap((response) => {
          this.token = response.token;
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  register(
    userRegistrationDto: UserRegistrationDto
  ): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(
      `${this.apiUrl}/register`,
      userRegistrationDto
    );
  }

  updateUserAdmin(
    userId: number,
    userUpdateDtoAdmin: UserUpdateDtoAdmin
  ): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(
      `${this.apiUrl}/update/${userId}/admin`,
      userUpdateDtoAdmin
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => {
          localStorage.removeItem('token');
          this.token = null;
          this.isAuthenticatedSubject.next(false);
        },
        error: (err) => {
          console.error('Logout failed', err);
        },
      })
    );
  }

  deactivateUser(userId: number): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(
      `${this.apiUrl}/${userId}/deactivate`,
      {}
    );
  }

  activateUser(userId: number): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(
      `${this.apiUrl}/${userId}/activate`,
      {}
    );
  }

  getToken(): string | null {
    const token = this.token || localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = new Date().getTime();

      if (currentTime > expirationTime) {
        localStorage.removeItem('token');
        this.isAuthenticatedSubject.next(false);
        return null;
      }
      return token;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ id: number }>(token);
      return decodedToken.id;
    }
    return null;
  }

  getUserFirstName(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ firstName: string }>(token);
      return decodedToken.firstName;
    }
    return null;
  }

  getUserLastName(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ lastName: string }>(token);
      return decodedToken.lastName;
    }
    return null;
  }

  getUserUsername(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ username: string }>(token);
      return decodedToken.username;
    }
    return null;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ role: string }>(token);
      return decodedToken.role;
    }
    return null;
  }
}
