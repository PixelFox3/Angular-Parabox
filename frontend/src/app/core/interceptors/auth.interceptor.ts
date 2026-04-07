import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (!req.url.startsWith(environment.apiUrl)) {
        return next(req);
    }

    const token = authService.accessToken();
    const authReq = token ? addToken(req, token) : req;

    return next(authReq).pipe(
        catchError((error: unknown) => {
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                !req.url.includes('/auth/refresh') &&
                !req.url.includes('/auth/login')
            ) {
                return authService.refreshToken().pipe(
                    switchMap((res) => next(addToken(req, res.accessToken))),
                    catchError((refreshError: unknown) => throwError(() => refreshError)),
                );
            }
            return throwError(() => error);
        }),
    );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
