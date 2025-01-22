import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserLoginDto } from '../dto/user-login.dto';
import { tap, Observable } from 'rxjs';
import { LoginResponseDto } from '../dto/login-response.dto';
import { jwtDecode } from 'jwt-decode';
import { UserRegistrationDto } from '../dto/user-registration.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private token: string | null = null;
  private currentUser: UserResponseDto | null = null;

  constructor(private http: HttpClient) {}

  login(userLoginDto: UserLoginDto): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${this.apiUrl}/login`, userLoginDto)
      .pipe(
        tap((response) => {
          this.token = response.token;
          this.currentUser = response.userResponseDto;
          localStorage.setItem('token', response.token);
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

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
      })
    );
  }

  deactivateUser(userId: number): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(
      `${this.apiUrl}/${userId}/deactivate`,
      {}
    );
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ role: string }>(token);
      return decodedToken.role;
    }
    return null;
  }

  getCurrentUser(): UserResponseDto | null {
    return this.currentUser;
  }
}
