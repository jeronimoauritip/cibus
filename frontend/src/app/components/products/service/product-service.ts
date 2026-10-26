import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRequest } from '../models/product-request';
import { ProductCategory } from '../models/product-category';

@Injectable({providedIn:'root'})
export class ProductService {
    private readonly http= inject(HttpClient);

    create (product: ProductRequest): Observable<ProductRequest>{
        return this.http.post<ProductRequest>('/api/products',product);
    }

    getCategories(): Observable<ProductCategory[]>{
        return this.http.get<ProductCategory[]>('/api/product-categories')
    }
}
