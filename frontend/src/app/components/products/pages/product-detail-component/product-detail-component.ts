import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../header-component/header-component';
import { ProductService } from '../../service/product-service';
import { Product, ProductCategory, ProductRequest } from '../../models/product';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-detail-component',
  imports: [HeaderComponent, FormsModule],
  templateUrl: './product-detail-component.html',
  styleUrl: './product-detail-component.css'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProductService);

  readonly product = signal<Product | null>(null);
  readonly categories = signal<ProductCategory[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly saving = signal(false);

  name = '';
  description = '';
  categoryId!: number;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // forkJoin ejecuta ambas peticiones en paralelo y espera a que terminen
    forkJoin({
      product: this.service.getById(id),
      categories: this.service.getCategories()
    }).subscribe({
      next: (res) => {
        this.product.set(res.product);
        this.categories.set(res.categories);

        // Inicializamos los campos del formulario
        this.name = res.product.name;
        this.description = res.product.description ?? '';

        // Buscamos la categoría actual por nombre para obtener su ID y preseleccionar el select
        const currentCategory = res.categories.find(c => c.name === res.product.categoryName);
        if (currentCategory) {
          this.categoryId = currentCategory.id;
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onSave(): void {
    const currentProduct = this.product();
    if (!currentProduct) return;
    
    this.saving.set(true);

    const updatedProduct = {
      name: this.name,
      description: this.description,
      categoryId: this.categoryId
    };

    this.service.update(currentProduct.id, updatedProduct).subscribe({
      next: () => {
        this.saving.set(false);
        this.service.products.reload();
        this.router.navigate(['/admin/menu']);
      },
      error: () => {
        this.saving.set(false);
        this.error.set(true);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/admin/menu']);
  }
}