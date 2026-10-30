import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../service/product-service';
import { ProductFilter } from '../../models/product-filter';
import { Product } from '../../models/product';
import { ProductRowComponent } from '../../components/product-row-component/product-row-component';
import { ProductFilterComponent } from '../../components/product-filter-component/product-filter-component';
import { HeaderComponent } from '../../../header-component/header-component';
import { Router } from '@angular/router';

@Component({
  imports: [ProductRowComponent, ProductFilterComponent, HeaderComponent],
  selector: 'app-product-list-component',
  styleUrl: './product-list-component.css',
  templateUrl: './product-list-component.html',
})
export class ProductListComponent {
  private readonly service= inject(ProductService);
  readonly filter= signal <ProductFilter>({name:'',category:''});
  private readonly router = inject(Router);

  readonly filteredProducts = computed<Product[]>(()=>
  this.service.products.value()
  ?.filter(p=>
    p.name.toLowerCase().includes(this.filter().name.toLowerCase())&&
    (this.filter().category===''|| p.categoryName===this.filter().category)
  )?? []
);

  readonly groupedProducts = computed(() => {
    const map = new Map<string, Product[]>();
    for (const p of this.filteredProducts()) {
      const list = map.get(p.categoryName) ?? [];
      list.push(p);
      map.set(p.categoryName, list);
    }
    return Array.from(map.entries()).map(([category, products]) => ({ category, products }));
  });

  readonly loading= computed(()=> this.service.products.isLoading() );
  readonly error = computed(() => this.service.products.error());

  onEdit(product: Product): void {
  this.router.navigate(['/admin/menu', product.id]);
  }


  onDelete(product: Product): void {
    this.service.delete(product.id).subscribe({
      next: () => {
        this.service.products.update(currentList => 
          (currentList ?? []).filter(p => p.id !== product.id)
        );
      },
      error: () => {
        alert('Hubo un error al intentar eliminar el producto.');
      }
    });
  }

  onNewProduct(): void {
    this.router.navigate(['/products/new']);
  }

}
