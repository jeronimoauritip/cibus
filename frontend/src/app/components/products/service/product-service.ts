import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRequest } from '../models/product';
import { ProductCategory } from '../models/product';
import { Product } from '../models/product';

@Injectable({providedIn:'root'})
export class ProductService {
    private readonly http= inject(HttpClient);
    private readonly apiUrl = '/api/products';
    readonly products = httpResource<Product[]>(
  () => this.apiUrl,
  { parse: (res: any) => res.content });
    readonly categories = httpResource<ProductCategory[]>(() => '/api/product-categories');


    create (product: ProductRequest): Observable<ProductRequest>{
        return this.http.post<ProductRequest>('/api/products',product);
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`/api/products/${id}`);
    }

    getCategories(): Observable<ProductCategory[]>{
        return this.http.get<ProductCategory[]>('/api/product-categories')
    }
    
    update(productId: number, dto: ProductRequest): Observable<Product> {
        return this.http.put<Product>(`/api/products/${productId}`, dto);
    }

    delete(productId: number): Observable<void> {
        return this.http.delete<void>(`/api/products/${productId}`);
    }

    getCategoryByName(name:string): Observable<ProductCategory> {
        return this.http.get<ProductCategory>(`/api/product-categories/name/${name}`);
    } 

}
