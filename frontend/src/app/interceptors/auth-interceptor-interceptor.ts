import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../Auth/services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  
  const isPublicAuthUrl = req.url.includes('/api/auth') && req.method === 'POST';

  const authReq = token && !isPublicAuthUrl
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const retryWithCurrentToken = () =>
    next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken()}` } }));

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isPublicAuthUrl) {
        return throwError(() => error);
      }

      const current = auth.accessToken();
      if (current && current !== token) {
        return retryWithCurrentToken();
      }

      return auth.refresh().pipe(
        catchError(refreshError => {
          auth.logout();
          return throwError(() => refreshError);
        }),
        switchMap(() => retryWithCurrentToken())
      );
    })
  );
};