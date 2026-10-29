import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User, UserRequest, UserUpdate, ChangeRoleRequest, ChangePasswordRequest, ResetPinRequest, Page, UserFilterParams} from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';


  getAll(filters?: UserFilterParams): Observable<Page<User>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof UserFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<Page<User>>(this.apiUrl, { params });
  }

  getById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  create(request: UserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  update(userId: number, dto: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, dto);
  }

  changePassword(userId: number, request: ChangePasswordRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/change-password`, request);
  }

  resetPin(userId: number, request: ResetPinRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/reset-pin`, request);
  }

  changeRole(userId: number, request: ChangeRoleRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/change-role`, request);
  }

  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`);
  }
}
