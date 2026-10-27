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

    const retryWithCurrentToken = () =>
    next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken()}` } }));

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthUrl) {
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
