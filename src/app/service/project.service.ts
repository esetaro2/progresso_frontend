import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectDto } from '../dto/project.dto';
import { Page } from '../dto/page.dto';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';

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

  getProjectCompletionPercentage(projectId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${projectId}/completion`)
  }

  getProjectById(id: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.apiUrl}/${id}`);
  }

  getAllProjectsWithFilters(
    page: number,
    size: number,
    status?: string,
    priority?: string,
    name?: string,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (status != null && status.length != 0)
      params = params.set('status', status);
    if (priority != null && priority.length != 0)
      params = params.set('priority', priority);
    if (name != null && name.length != 0) params = params.set('name', name);

    return this.http.get<Page<ProjectDto>>(this.apiUrl, { params });
  }

  getProjectsByManagerAndFilters(
    managerUsername: string,
    page: number,
    size: number,
    status?: string,
    priority?: string,
    name?: string,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (status != null && status.length != 0)
      params = params.set('status', status);
    if (priority != null && priority.length != 0)
      params = params.set('priority', priority);
    if (name != null && name.length != 0) params = params.set('name', name);

    return this.http.get<Page<ProjectDto>>(
      `${this.apiUrl}/manager/${managerUsername}`,
      { params }
    );
  }

  getProjectsByTeamMemberAndFilters(
    teamMemberUsername: string,
    page: number,
    size: number,
    status?: string,
    priority?: string,
    name?: string,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (status != null && status.length != 0)
      params = params.set('status', status);
    if (priority != null && priority.length != 0)
      params = params.set('priority', priority);
    if (name != null && name.length != 0) params = params.set('name', name);

    return this.http.get<Page<ProjectDto>>(
      `${this.apiUrl}/teamMember/${teamMemberUsername}`,
      { params }
    );
  }

  findByTeamId(
    teamId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/team/${teamId}`, {
      params,
    });
  }

  findByTeamIdAndStatus(
    teamId: number,
    status: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(
      `${this.apiUrl}/team/${teamId}/status/${status}`,
      { params }
    );
  }

  findByTeamIdAndDueDateBefore(
    teamId: number,
    dueDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(
      `${this.apiUrl}/team/${teamId}/due-date-before/${dueDate}`,
      { params }
    );
  }

  findActiveByTeamId(
    teamId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(
      `${this.apiUrl}/team/${teamId}/active`,
      { params }
    );
  }

  createProject(projectDto: ProjectDto): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.apiUrl, projectDto);
  }

  updateProject(
    projectId: number,
    projectDto: ProjectDto
  ): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}`, projectDto);
  }

  removeProject(projectId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(
      `${this.apiUrl}/${projectId}/remove`,
      null
    );
  }

  updateProjectManager(
    projectId: number,
    projectManagerId: number
  ): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(
      `${this.apiUrl}/${projectId}/update-manager/${projectManagerId}`,
      null
    );
  }

  assignTeamToProject(
    projectId: number,
    teamId: number
  ): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(
      `${this.apiUrl}/${projectId}/assign-team/${teamId}`,
      null
    );
  }

  reassignTeamToProject(
    projectId: number,
    teamId: number
  ): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(
      `${this.apiUrl}/${projectId}/reassign-team/${teamId}`,
      null
    );
  }

  completeProject(projectId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(
      `${this.apiUrl}/${projectId}/complete`,
      null
    );
  }
}
