import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectDto } from '../dto/project.dto';
import { Page } from '../dto/page.dto';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  private createPageableParams(page: number, size: number, sort?: string): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return params;
  }

  getAllProjects(page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(this.apiUrl, { params });
  }

  getProjectById(id: number): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.apiUrl}/${id}`);
  }

  getProjectsByStatus(status: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/status/${status}`, { params });
  }

  getProjectsByManager(managerId: number, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/manager/${managerId}`, { params });
  }

  getProjectsByPriority(priority: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/priority/${priority}`, { params });
  }

  getProjectsDueBefore(date: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/due-before/${date}`, { params });
  }

  getProjectsCompletionAfter(date: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/completion-after/${date}`, { params });
  }

  getActiveProjectsByManager(managerId: number, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/manager/${managerId}/active`, { params });
  }

  getProjectsByTaskStatus(taskStatus: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/task-status/${taskStatus}`, { params });
  }

  findByTeamId(teamId: number, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/team/${teamId}`, { params });
  }

  findByTeamIdAndStatus(teamId: number, status: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/team/${teamId}/status/${status}`, { params });
  }

  findByTeamIdAndDueDateBefore(teamId: number, dueDate: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/team/${teamId}/due-date-before/${dueDate}`, { params });
  }

  findActiveByTeamId(teamId: number, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/team/${teamId}/active`, { params });
  }

  getProjectsByStatusAndPriority(status: string, priority: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/status/${status}/priority/${priority}`, { params });
  }

  getProjectsByStartDateBetween(startDate: string, endDate: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/start-date-between/${startDate}/${endDate}`, { params });
  }

  getProjectsByCompletionDateBefore(completionDate: string, page: number, size: number, sort?: string): Observable<Page<ProjectDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<ProjectDto>>(`${this.apiUrl}/completion-date-before/${completionDate}`, { params });
  }

  createProject(projectDto: ProjectDto): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.apiUrl, projectDto);
  }

  updateProject(projectId: number, projectDto: ProjectDto): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}`, projectDto);
  }

  removeProject(projectId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}/remove`, null);
  }

  updateProjectManager(projectId: number, projectManagerId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}/update-manager/${projectManagerId}`, null);
  }

  assignTeamToProject(projectId: number, teamId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}/assign-team/${teamId}`, null);
  }

  reassignTeamToProject(projectId: number, teamId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}/reassign-team/${teamId}`, null);
  }

  completeProject(projectId: number): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.apiUrl}/${projectId}/complete`, null);
  }
}
