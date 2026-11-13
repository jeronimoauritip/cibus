import { Component, computed, inject, input, output, signal } from '@angular/core';
import { ProductService } from '../../service/product-service';
import { ProductFilter } from '../../models/product-filter';
import { Product } from '../../models/product';
import { ProductRowComponent } from '../../components/product-row-component/product-row-component';
import { ProductFilterComponent } from '../../components/product-filter-component/product-filter-component';
import { HeaderComponent } from '../../../header-component/header-component';
import { Router } from '@angular/router';
import { BackButtonDirective } from '../../../back-button/back-button.directive';

@Component({
  imports: [ProductRowComponent, ProductFilterComponent, HeaderComponent, BackButtonDirective],
  selector: 'app-product-list-component',
  styleUrl: './product-list-component.css',
  templateUrl: './product-list-component.html',
})
export class ProductListComponent {
  private readonly service = inject(ProductService);
  readonly filter = signal<ProductFilter>({ name: '', category: '' });
  private readonly router = inject(Router);

  readonly isSelectionMode = input<boolean>(false);
  readonly productSelected = output<Product>();

  readonly excludedProductIds = input<number[]>([]);

  readonly filteredProducts = computed<Product[]>(() => {
    const excluded = this.excludedProductIds() ?? []; 
    return this.service.products.value()
      ?.filter(p =>
        p.name.toLowerCase().includes(this.filter().name.toLowerCase()) &&
        (this.filter().category === '' || p.categoryName === this.filter().category) &&
        !excluded.includes(p.id) 
      ) ?? [];
  });

  readonly groupedProducts = computed(() => {
    const map = new Map<string, Product[]>();
    for (const p of this.filteredProducts()) {
      const list = map.get(p.categoryName) ?? [];
      list.push(p);
      map.set(p.categoryName, list);
    }
    return Array.from(map.entries()).map(([category, products]) => ({ category, products }));
  });

  readonly loading = computed(() => this.service.products.isLoading());
  readonly error = computed(() => this.service.products.error());

  // Nueva función para manejar el clic en la fila (la llamás desde el HTML del row si está en modo selección)
  onSelectProduct(product: Product): void {
    if (this.isSelectionMode()) {
      this.productSelected.emit(product);
    }
  }

  onEdit(product: Product): void {
    if (this.isSelectionMode()) return;
    this.router.navigate(['/admin/menu', product.id]);
  }

  onDelete(product: Product): void {
    if (this.isSelectionMode()) return;
    this.service.delete(product.id).subscribe({
      next: () => {
        this.service.products.update(currentList =>
          (currentList ?? []).filter(p => p.id !== product.id)
        );
      },
      error: () => {
        alert('Something went wrong trying to eliminate product');
      }
    });
  }

  onNewProduct(): void {
    if (this.isSelectionMode()) return;
    this.router.navigate(['/admin/menu/new']);
  }

}
