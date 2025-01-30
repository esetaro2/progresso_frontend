import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserLoginDto } from '../dto/user-login.dto';
import { tap, Observable } from 'rxjs';
import { LoginResponseDto } from '../dto/login-response.dto';
import { jwtDecode } from 'jwt-decode';
import { UserRegistrationDto } from '../dto/user-registration.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private token: string | null = null;

  constructor(private http: HttpClient, private userService: UserService) {}

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
      tap(() => {
        this.token = null;
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
    const token = this.token || localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = new Date().getTime();

      if (currentTime > expirationTime) {
        this.logout().subscribe();
        return null;
      }
      return token;
    }
    return null;
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

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = jwtDecode<{ id: number }>(token);
      return decodedToken.id;
    }
    return null;
  }
}
