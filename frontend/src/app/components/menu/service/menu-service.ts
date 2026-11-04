import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem, MenuItemRequest, MenuItemUpdate, Page } from '../models/menu-item';

@Service()
export class MenuService {

    private readonly http = inject(HttpClient);
    

    getAll(branchId: number): Observable<Page<MenuItem>> {
        return this.http.get<Page<MenuItem>>(`/api/branches/${branchId}/products`);
    }

    create(branchId: number, request: MenuItemRequest): Observable<MenuItem> {
        return this.http.post<MenuItem>(`/api/branches/${branchId}/products`, request);
    }

    update(branchId: number, productId: number, dto: MenuItemUpdate): Observable<MenuItem> {
        return this.http.put<MenuItem>(`/api/branches/${branchId}/products/${productId}`, dto);
    }

    delete(branchId: number, productId: number): Observable<void> {
        return this.http.delete<void>(`/api/branches/${branchId}/products/${productId}`);
    }

}
