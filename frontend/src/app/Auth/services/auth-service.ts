import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RoleModel } from '../../Roles/role-model';
import { AuthUser } from '../models/auth-user';
import { LoginCredentials } from '../models/login-credentials';
import { AuthResponse } from '../models/auth-response';
import { Observable, firstValueFrom, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

const REFRESH_KEY = 'refresh_token'
const LEGACY_USER_KEY = 'auth_user'

function decodeJwt(token: string): { authorities?: string[]; exp?: number } | null {
    try {
        const part = token.split('.')[1]
        if (!part) return null
        const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')))
    } catch {
        return null
    }
}

@Injectable({providedIn:'root'})
export class AuthService {
    private readonly http= inject(HttpClient)
    private readonly router= inject(Router)

    private readonly _user= signal<AuthUser | null>(null)
    private readonly _loading= signal (false)
    private readonly _error= signal<string | null>(null)
    private readonly _accessToken = signal<string | null>(null);
    readonly accessToken = this._accessToken.asReadonly();
    private readonly _refreshToken = signal<string | null>(null);


    readonly user = this._user.asReadonly()
    readonly loading = this._loading.asReadonly()
    readonly error= this._error.asReadonly()
    
    readonly isLogged = computed(()=> this._user()!==null)
    readonly role= computed(() => this._user()?.role.role ?? null)
    readonly isAdmin = computed(()=>this.role()==='Admin')
   readonly isManager = computed(()=>this.role()==='Manager'|| this.role()==='Admin')
    
    static requiredCredentials(role: RoleModel): boolean {
     return role.role === 'Manager' || role.role === 'Admin'
    }
    constructor()
    {
        localStorage.removeItem(LEGACY_USER_KEY)
        this._refreshToken.set(localStorage.getItem(REFRESH_KEY))
    }

    private setSession(response: AuthResponse): boolean {
        const token = response.AccessToken ?? response.accessToken ?? ''
        const payload = token ? decodeJwt(token) : null
        const roleName = (payload?.authorities ?? []).find(a => a.startsWith('ROLE_'))?.replace('ROLE_', '')
        if (!payload || !roleName) {
            this.clearSession()
            return false
        }

        this._accessToken.set(token)
        if (response.refreshToken) {
            this._refreshToken.set(response.refreshToken)
            localStorage.setItem(REFRESH_KEY, response.refreshToken)
        }
        const role = (roleName.charAt(0) + roleName.slice(1).toLowerCase()) as RoleModel['role']
        this._user.set({ role: { role } } as AuthUser)
        return true
    }

    private onAuthSuccess(response: AuthResponse): void {
        this._loading.set(false)
        if (this.setSession(response)) {
            this.router.navigate(['/'])
        } else {
            this._error.set('Invalid server response')
        }
    }

    loginWithPin( pin:string):void{

         this._loading.set(true) 
        this._error.set(null) 

          this.http.post<AuthResponse>('/api/auth',{ username: pin, password: pin }).subscribe({
            next:response=> this.onAuthSuccess(response),
            error:()=>{
                this._error.set('WRONG PIN')
                this._loading.set(false)
            }
        })

        
    }
    loginWithCredentials(credentials: LoginCredentials): void {
    this._loading.set(true)
    this._error.set(null)
    this.http.post<AuthResponse>('/api/auth', {
        username: credentials.email,
        email: credentials.email,
        password: credentials.password
    }).subscribe({
        next: response => this.onAuthSuccess(response),

        error: () => {
            this._error.set('Wrong email or password');
            this._loading.set(false);
        }
    })
    }
    refresh(): Observable<AuthResponse> {
        const refreshToken = this._refreshToken()
        if (!refreshToken) return throwError(() => new Error('No refresh token'))
        return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken }).pipe(
            tap(response => {
                if (!this.setSession(response)) throw new Error('Invalid refresh response')
            })
        )
    }

    restoreSession(): Promise<void> {
        if (!this._refreshToken()) return Promise.resolve()
        return firstValueFrom(this.refresh()).then(
            () => undefined,
            () => this.clearSession()
        )
    }
        clearError(): void {
        this._error.set(null)
    }

    private clearSession(): void {
        this._user.set(null)
        this._accessToken.set(null)
        this._refreshToken.set(null)
        localStorage.removeItem(REFRESH_KEY)
        localStorage.removeItem(LEGACY_USER_KEY)
    }

    logout(): void {
        this.clearSession()
        this.router.navigate(['/login'])
    }
}
