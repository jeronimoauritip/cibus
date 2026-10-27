import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RoleModel } from '../../Roles/role-model';
import { AuthUser } from '../models/auth-user';
import { LoginCredentials } from '../models/login-credentials';
import { AuthResponse } from '../models/auth-response';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
        const saved = localStorage.getItem('auth_user')
        if (saved){
            try{
                this._user.set(JSON.parse(saved)as AuthUser)
            }catch{
                localStorage.removeItem('auth_user')
            }
        }
    }
    private loggedIn (user: AuthUser):void{
        this._user.set(user)
        localStorage.setItem('auth_user', JSON.stringify(user))
        this.router.navigate(['/'])
    }
    private onAuthSuccess(response: AuthResponse): void {
        const token = response.AccessToken ?? response.accessToken ?? ''
        this._accessToken.set(token)
        this._refreshToken.set(response.refreshToken)
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        const name = ((payload.authorities as string[]).find(a => a.startsWith('ROLE_')) ?? '').replace('ROLE_', '')
        const role = (name.charAt(0) + name.slice(1).toLowerCase()) as RoleModel['role']
        this.loggedIn({ role: { role } } as AuthUser)
        this._loading.set(false)
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
    return this.http.post<AuthResponse>('/api/auth/refresh', {
        refreshToken: this._refreshToken()
    }).pipe(
        tap(response => {
            const token = response.AccessToken ?? response.accessToken ?? '';
            this._accessToken.set(token);
            this._refreshToken.set(response.refreshToken);
        })
    );
    }
        clearError(): void {
        this._error.set(null)
    }

    logout(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    localStorage.removeItem('auth_user');
    this.router.navigate(['/login']);
    }
}
