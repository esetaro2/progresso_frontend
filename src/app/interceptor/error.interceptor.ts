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
          `Server Error Code: ${error.status} - ${error.statusText}`
        );

        if (error.status === 400) {
          if (error.error && typeof error.error === 'object') {
            errorMessage = error.error.message || JSON.stringify(error.error);
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else {
            errorMessage = 'Bad request.';
          }
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }

      console.error('Error Message:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
}
