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

  createAndAssignTaskToUser(
    taskDto: TaskDto,
    userId: number
  ): Observable<TaskDto> {
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.post<TaskDto>(`${this.apiUrl}`, taskDto, { params });
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
