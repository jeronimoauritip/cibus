import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRequest } from '../models/product-request';
import { ProductCategory } from '../models/product-category';
import { Product } from '../models/product';

@Injectable({providedIn:'root'})
export class ProductService {
    private readonly http= inject(HttpClient);
    readonly productos = httpResource<Product[]>(() => '/api/products');
    readonly categorias = httpResource<ProductCategory[]>(() => '/api/product-categories');
    create (product: ProductRequest): Observable<ProductRequest>{
        return this.http.post<ProductRequest>('/api/products',product);
    }

    getCategories(): Observable<ProductCategory[]>{
        return this.http.get<ProductCategory[]>('/api/product-categories')
    }
    
}
