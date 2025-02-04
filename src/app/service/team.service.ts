// src/app/services/team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamDto } from '../dto/team.dto';
import { Page } from '../dto/page.dto';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = 'http://localhost:8080/api/teams';

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

  getAvailableTeams(
    page: number,
    size: number,
    searchQuery?: string,
    sort?: string
  ): Observable<Page<TeamDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (searchQuery) {
      params = params.set('searchTerm', searchQuery);
    }

    return this.http.get<Page<TeamDto>>(`${this.apiUrl}/availableTeams`, {
      params,
    });
  }

  getAllTeams(
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TeamDto>>(this.apiUrl, { params });
  }

  getTeamById(teamId: number): Observable<TeamDto> {
    return this.http.get<TeamDto>(`${this.apiUrl}/${teamId}`);
  }

  getTeamByName(name: string): Observable<TeamDto> {
    return this.http.get<TeamDto>(`${this.apiUrl}/search/by-name/${name}`);
  }

  getTeamsByActive(
    active: boolean,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort).set(
      'active',
      active.toString()
    );
    return this.http.get<Page<TeamDto>>(`${this.apiUrl}/active`, { params });
  }

  getTeamsByMemberId(
    userId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TeamDto>>(`${this.apiUrl}/user/${userId}`, {
      params,
    });
  }

  getTeamsWithProjects(
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TeamDto>>(`${this.apiUrl}/with-projects`, {
      params,
    });
  }

  getTeamsWithMinMembers(
    size: number,
    page: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TeamDto>>(`${this.apiUrl}/min-members/${size}`, {
      params,
    });
  }

  getTeamsWithoutMembers(
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TeamDto>>(`${this.apiUrl}/without-members`, {
      params,
    });
  }

  getTeamsByProjectId(
    projectId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TeamDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TeamDto>>(
      `${this.apiUrl}/by-project/${projectId}`,
      { params }
    );
  }

  createTeam(teamName: string): Observable<TeamDto> {
    const params = new HttpParams().set('teamName', teamName);
    return this.http.post<TeamDto>(this.apiUrl, null, { params });
  }

  updateTeam(teamId: number, newName: string): Observable<TeamDto> {
    const params = new HttpParams().set('newName', newName);
    return this.http.put<TeamDto>(`${this.apiUrl}/${teamId}`, null, { params });
  }

  addMembersToTeam(teamId: number, userIds: number[]): Observable<TeamDto> {
    return this.http.post<TeamDto>(`${this.apiUrl}/${teamId}/members`, userIds);
  }

  removeMembersFromTeam(
    teamId: number,
    userIds: number[]
  ): Observable<TeamDto> {
    return this.http.post<TeamDto>(
      `${this.apiUrl}/${teamId}/remove-members`,
      userIds
    );
  }

  deleteTeam(teamId: number): Observable<TeamDto> {
    return this.http.delete<TeamDto>(`${this.apiUrl}/${teamId}`);
  }
}
