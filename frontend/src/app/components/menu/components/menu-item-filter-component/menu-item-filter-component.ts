import { Component, computed, inject, model, signal } from '@angular/core';
import { MenuService } from '../../service/menu-service';
import { ProductFilter } from '../../models/menu-item';
import { form, FormField } from '@angular/forms/signals';
import { ProductService } from '../../../products/service/product-service';

@Component({
  imports: [FormField],
  selector: 'app-menu-item-filter-component',
  styleUrl: './menu-item-filter-component.css',
  templateUrl: './menu-item-filter-component.html',
})
export class MenuItemFilterComponent {
  private readonly productService = inject(ProductService);
  readonly filter = model.required<ProductFilter>();
  readonly filterForm = form(this.filter);
  readonly isOpen = signal(false);

  readonly categories = computed(() => this.productService.categories.value() ?? []);
  readonly names = computed(() =>
    Array.from(new Set((this.productService.products.value() ?? []).map(p => p.name)))
  );
  readonly hasNoFilter = computed(() => this.filter().name === '' && this.filter().category === '');
}
