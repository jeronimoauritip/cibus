import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../Auth/services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthUrl = req.url.includes('/api/auth');
  const token = auth.accessToken();

  const authReq = token && !isAuthUrl
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthUrl) {
        return auth.refresh().pipe(
          switchMap(() => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${auth.accessToken()}` }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            auth.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};