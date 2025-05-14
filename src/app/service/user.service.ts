import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponseDto } from '../dto/user-response.dto';
import { Page } from '../dto/page.dto';
import { UserUpdateDtoAdmin } from '../dto/user-update-dto-admin';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

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

  getUserDetailsAdmin(userId: number): Observable<UserUpdateDtoAdmin> {
    return this.http.get<UserUpdateDtoAdmin>(
      `${this.apiUrl}/${userId}/details/admin`
    );
  }

  getAllUsers(
    page: number,
    size: number,
    searchTerm?: string,
    role?: string,
    active?: boolean,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (searchTerm != null && searchTerm.length != 0)
      params = params.set('searchTerm', searchTerm);

    if (role != null && role.length != 0) params = params.set('role', role);

    if (active != null) params = params.set('active', active);

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

    return this.http.get<Page<UserResponseDto>>(
      `${this.apiUrl}/available-project-managers`,
      {
        params,
      }
    );
  }

  getAvailableTms(
    page: number,
    size: number,
    searchTerm?: string,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (searchTerm != null && searchTerm.length != 0)
      params = params.set('searchTerm', searchTerm);

    return this.http.get<Page<UserResponseDto>>(
      `${this.apiUrl}/available-team-members`,
      { params }
    );
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
    searchTerm?: string,
    sort?: string
  ): Observable<Page<UserResponseDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (searchTerm != null && searchTerm.length != 0)
      params = params.set('searchTerm', searchTerm);

    return this.http.get<Page<UserResponseDto>>(
      `${this.apiUrl}/teams/${teamId}/team-members`,
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
