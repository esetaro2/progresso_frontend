import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserResponseDto } from '../dto/user-response.dto';
import { Page } from '../dto/page.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';
  private currentUserSubject = new BehaviorSubject<UserResponseDto | null>(
    null
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  initializeUser(userId: number): void {
    this.getUserById(userId).subscribe((user) => {
      this.currentUserSubject.next(user);
    });
  }

  getCurrentUser(): Observable<UserResponseDto | null> {
    return this.currentUser$;
  }

  private createPageableParams(
    page: number,
    size: number,
    sort?: string
  ): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return params;
  }

  getUserById(userId: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/${userId}`);
  }

  getAllUsers(
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<UserResponseDto>>(this.apiUrl, { params });
  }

  getAvailablePms(
    page: number,
    size: number,
    searchTerm?: string,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (searchTerm != null && searchTerm.length != 0)
      params = params.set('searchTerm', searchTerm);

    return this.http.get<Page<UserResponseDto>>(`${this.apiUrl}/availablePms`, {
      params,
    });
  }

  getUsersByRole(
    roleName: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<UserResponseDto>>(
      `${this.apiUrl}/role/${roleName}`,
      { params }
    );
  }

  searchUsers(
    firstName: string | null,
    lastName: string | null,
    username: string | null,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    let params = this.createPageableParams(page, size, sort);
    if (firstName) {
      params = params.set('firstName', firstName);
    }
    if (lastName) {
      params = params.set('lastName', lastName);
    }
    if (username) {
      params = params.set('username', username);
    }
    return this.http.get<Page<UserResponseDto>>(`${this.apiUrl}/search`, {
      params,
    });
  }

  getUsersByTeamId(
    teamId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<UserResponseDto>>(
      `${this.apiUrl}/teams/${teamId}/users`,
      { params }
    );
  }

  getUserFromTeam(teamId: number, userId: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(
      `${this.apiUrl}/teams/${teamId}/user/${userId}`
    );
  }

  getUsersByProjectId(
    projectId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<UserResponseDto>>(
      `${this.apiUrl}/projects/${projectId}/users`,
      { params }
    );
  }

  findActiveUsers(
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<UserResponseDto>>(`${this.apiUrl}/active`, {
      params,
    });
  }
}
