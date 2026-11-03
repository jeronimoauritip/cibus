import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem, MenuItemRequest, MenuItemUpdate, Page } from '../models/menu-item';

@Service()
export class MenuService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/branches/{branchId}/products';

    getAll(): Observable<Page<MenuItem>> {
        return this.http.get<Page<MenuItem>>(this.apiUrl);
    }

    create(request: MenuItemRequest): Observable<MenuItem> {
        return this.http.post<MenuItem>(this.apiUrl, request);
    }

    update(productId: number, dto: MenuItemUpdate): Observable<MenuItem> {
        return this.http.put<MenuItem>(`${this.apiUrl}/${productId}`, dto);
    }

    delete(productId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${productId}`);
    }

}
