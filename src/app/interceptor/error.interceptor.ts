import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function ErrorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred. Please try again later.';
      if (error.error instanceof ErrorEvent) {
        console.error('Client Error:', error.error.message);
        errorMessage = error.error.message;
      } else {
        console.error(
          `Server Error Code: ${error.status}\nMessage: ${error.message}`
        );
        if (error.status === 400 && error.error) {
          errorMessage = error.error.message || JSON.stringify(error.error);
        } else if (error.error && typeof error.error === 'object') {
          errorMessage = JSON.stringify(error.error);
        } else {
          errorMessage = error.message;
        }
      }
      console.error('Error Message:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
}
