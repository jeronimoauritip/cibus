import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RoleModel } from '../../Roles/role-model';
import { AuthUser } from '../models/auth-user';

@Injectable({providedIn:'root'})
export class AuthService {
    private readonly http= inject(HttpClient)
    private readonly router= inject(Router)

    private readonly _user= signal<AuthUser | null>(null)
    private readonly _loading= signal (false)
    private readonly _error= signal<string | null>(null)

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
    loginWithPin( pin:string):void{

         this._loading.set(true) 
        this._error.set(null) 

        this.http.post<AuthUser>('/api/auth/pin',{ pin}).subscribe({
            next:user=> {
                this.loggedIn(user)
                this._loading.set(false)
            },
            error:()=>{
                this._error.set('WRONG PIN')
                this._loading.set(false)
            }
        })
        
    }
    loginWithCredentials (email:string, password: string): void{
        this._loading.set(true)
        this._error.set(null)

        this.http.post<AuthUser>('/api/auth/login', { email, password }).subscribe({
            next: user=>{
                this.loggedIn(user)
                this._loading.set(false)
            },
            error:()=>{
                this._error.set('Wrong email or password')
                this._loading.set(false)
            }
        })
    }
        clearError(): void {
        this._error.set(null)
    }

    logout ():void{
        this._user.set(null)
        localStorage.removeItem('auth_user')
        this.router.navigate(['/login'])
    }
}
