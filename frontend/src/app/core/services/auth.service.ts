import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

const TOKEN_KEY = 'parabox_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    private readonly _currentUser = signal<User | null>(null);
    private readonly _accessToken = signal<string | null>(this.readStoredToken());
    private readonly _isInitialized = signal(false);

    readonly currentUser = this._currentUser.asReadonly();
    readonly accessToken = this._accessToken.asReadonly();
    readonly isAuthenticated = computed(() => this._currentUser() !== null);
    readonly isInitialized = this._isInitialized.asReadonly();

    init(): Promise<void> {
        const token = this._accessToken();
        if (!token) {
            this._isInitialized.set(true);
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.http
                .get<User>(`${this.apiUrl}/me`)
                .pipe(catchError(() => { this.clearSession(); return EMPTY; }))
                .subscribe({
                    next: (user) => { this._currentUser.set(user); },
                    complete: () => { this._isInitialized.set(true); resolve(); },
                });
        });
    }

    login(email: string, password: string) {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
            .pipe(tap((res) => this.handleAuthResponse(res)));
    }

    register(email: string, password: string, name?: string) {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/register`, { email, password, name }, { withCredentials: true })
            .pipe(tap((res) => this.handleAuthResponse(res)));
    }

    logout() {
        return this.http
            .post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
            .pipe(tap(() => { this.clearSession(); void this.router.navigate(['/']); }));
    }

    updateProfile(name: string | null) {
        return this.http
            .patch<User>(`${environment.apiUrl}/users/me`, { name })
            .pipe(tap((user) => this._currentUser.set(user)));
    }

    refreshToken() {
        return this.http
            .post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
            .pipe(tap((res) => { this.setToken(res.accessToken); }));
    }

    private handleAuthResponse(res: AuthResponse): void {
        this._currentUser.set(res.user);
        this.setToken(res.accessToken);
    }

    private setToken(token: string): void {
        this._accessToken.set(token);
        localStorage.setItem(TOKEN_KEY, token);
    }

    private clearSession(): void {
        this._currentUser.set(null);
        this._accessToken.set(null);
        localStorage.removeItem(TOKEN_KEY);
    }

    private readStoredToken(): string | null {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }
}
