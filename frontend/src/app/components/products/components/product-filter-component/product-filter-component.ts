import { Component, computed, inject, model, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { ProductFilter } from '../../models/product-filter';
import { ProductService } from '../../service/product-service';

@Component({
  selector: 'app-product-filter-component',
  imports: [FormField],
  templateUrl: './product-filter-component.html',
  styleUrl: './product-filter-component.css'
})
export class ProductFilterComponent {
  private readonly service = inject(ProductService);
  readonly filter = model.required<ProductFilter>();
  readonly filterForm = form(this.filter);
  readonly isOpen = signal(false);

  readonly categories = computed(() => this.service.categories.value() ?? []);
  readonly names = computed(() =>
    Array.from(new Set((this.service.products.value() ?? []).map(p => p.name)))
  );
  readonly hasNoFilter = computed(() => this.filter().name === '' && this.filter().category === '');
}
