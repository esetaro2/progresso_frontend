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

  constructor(private http: HttpClient) {}

  login(userLoginDto: UserLoginDto): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${this.apiUrl}/login`, userLoginDto)
      .pipe(
        tap((response) => {
          this.token = response.token;
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
      tap({
        next: () => {
          localStorage.removeItem('token');
          this.token = null;
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

  getToken(): string | null {
    const token = this.token || localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = new Date().getTime();

      if (currentTime > expirationTime) {
        this.logout().subscribe({
          next: (response) => {
            console.log(response);
          }, error: (error) => {
            console.error(error);
          }
        });
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
