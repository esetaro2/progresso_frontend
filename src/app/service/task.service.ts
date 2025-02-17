// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDto } from '../dto/task.dto';
import { Page } from '../dto/page.dto';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

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

  getTaskById(taskId: number): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${this.apiUrl}/${taskId}`);
  }

  getTasksByStatus(
    status: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(`${this.apiUrl}/status/${status}`, {
      params,
    });
  }

  getTasksByPriority(
    priority: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(`${this.apiUrl}/priority/${priority}`, {
      params,
    });
  }

  getTasksByDueDateBefore(
    dueDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/dueDateBefore/${dueDate}`,
      { params }
    );
  }

  getTasksByCompletionDateAfter(
    completionDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/completionDateAfter/${completionDate}`,
      { params }
    );
  }

  getTasksByProjectIdAndFilters(
    projectId: number,
    page: number,
    size: number,
    status?: string,
    priority?: string,
    sort?: string
  ): Observable<Page<TaskDto>> {
    let params = this.createPageableParams(page, size, sort);

    if (status != null && status.length != 0)
      params = params.set('status', status);
    if (priority != null && priority.length != 0)
      params = params.set('priority', priority);

    return this.http.get<Page<TaskDto>>(`${this.apiUrl}/project/${projectId}`, {
      params,
    });
  }

  getTasksByProjectIdAndStatus(
    projectId: number,
    status: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/project/${projectId}/status/${status}`,
      { params }
    );
  }

  getTasksByNameAndProjectId(
    name: string,
    projectId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/project/${projectId}/name/${name}`,
      { params }
    );
  }

  getCompletedTasksByProjectId(
    projectId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/project/${projectId}/completed`,
      { params }
    );
  }

  getTasksByUser(
    userId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(`${this.apiUrl}/user/${userId}`, {
      params,
    });
  }

  getTasksByUserAndStatus(
    userId: number,
    status: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/user/${userId}/status/${status}`,
      { params }
    );
  }

  getOverdueTasksByUser(
    userId: number,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/user/${userId}/overdue`,
      { params }
    );
  }

  getTasksByAssignedUserIdAndCompletionDateBefore(
    userId: number,
    completionDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/assigned-user/${userId}/completion-date-before/${completionDate}`,
      { params }
    );
  }

  getTasksByAssignedUserIdAndStartDateAfter(
    userId: number,
    startDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/assigned-user/${userId}/start-date-after/${startDate}`,
      { params }
    );
  }

  getTasksByProjectIdAndCompletionDateBefore(
    projectId: number,
    completionDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/project/${projectId}/completion-date-before/${completionDate}`,
      { params }
    );
  }

  getTasksByStartDateBetween(
    startDate: string,
    endDate: string,
    page: number,
    size: number,
    sort?: string
  ): Observable<Page<TaskDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<TaskDto>>(
      `${this.apiUrl}/start-date-between/${startDate}/${endDate}`,
      { params }
    );
  }

  createAndAssignTaskToUser(
    taskDto: TaskDto,
    userId: number
  ): Observable<TaskDto> {
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.post<TaskDto>(`${this.apiUrl}`, taskDto, { params });
  }

  assignTaskToUser(taskId: number, userId: number): Observable<TaskDto> {
    return this.http.post<TaskDto>(
      `${this.apiUrl}/${taskId}/assign/${userId}`,
      null
    );
  }

  reassignTaskToUser(taskId: number, userId: number): Observable<TaskDto> {
    return this.http.post<TaskDto>(
      `${this.apiUrl}/${taskId}/reassign/${userId}`,
      null
    );
  }

  updateTask(taskId: number, taskDto: TaskDto): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.apiUrl}/${taskId}`, taskDto);
  }

  completeTask(taskId: number): Observable<TaskDto> {
    return this.http.patch<TaskDto>(`${this.apiUrl}/${taskId}/complete`, null);
  }

  removeTaskFromProject(projectId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/project/${projectId}/task/${taskId}`
    );
  }
}
