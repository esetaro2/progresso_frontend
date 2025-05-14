import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDto } from '../dto/comment.dto';
import { Page } from '../dto/page.dto';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/api/comments';

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

  findByProjectId(projectId: number, page: number, size: number, sort?: string): Observable<Page<CommentDto>> {
    const params = this.createPageableParams(page, size, sort);
    return this.http.get<Page<CommentDto>>(`${this.apiUrl}/project/${projectId}/comments`, { params });
  }

  createComment(commentDto: CommentDto): Observable<CommentDto> {
    return this.http.post<CommentDto>(this.apiUrl, commentDto);
  }

  updateComment(id: number, newContent: string): Observable<CommentDto> {
    return this.http.put<CommentDto>(`${this.apiUrl}/${id}`, null, { params: { newContent } });
  }

  deleteComment(id: number): Observable<CommentDto> {
    return this.http.delete<CommentDto>(`${this.apiUrl}/${id}`);
  }
}
