import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../service/product-service';
import { ProductCategory } from '../../models/product-category';

@Component({
  imports: [],
  selector: 'app-products-component',
  styleUrl: './products-component.css',
  templateUrl: './products-component.html',
})
export class ProductsComponent {
  private readonly service= inject (ProductService);

  readonly categories = signal<ProductCategory[]>([]);
  readonly loading= signal (false);
  readonly error= signal<string | null>(null);
  readonly success = signal (false);

  ngOnInit(): void {
    this.service.getCategories().subscribe({
      next: data => this.categories.set(data),
      error:()=> this.error.set('The categories could not be loaded')
    });
    }

   create(name: string, description: string, categoryId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.service.create({ name, description: description || undefined, categoryId }).subscribe({
      next: () => {
        this.loading.set(true);
        this.success.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error creating the product');
        this.loading.set(false);
      }
    });
  }
}