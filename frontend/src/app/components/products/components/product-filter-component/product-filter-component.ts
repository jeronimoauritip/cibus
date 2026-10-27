import { Component, computed, inject, model, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { FiltroProducto } from '../../models/filtro-producto';
import { ProductService } from '../../service/product-service';

@Component({
  selector: 'app-product-filter-component',
  imports: [FormField],
  templateUrl: './product-filter-component.html',
  styleUrl: './product-filter-component.css'
})
export class ProductFilterComponent {
  private readonly service = inject(ProductService);
  readonly filter = model.required<FiltroProducto>();
  readonly filtro = form(this.filter);
  readonly abierto = signal(false);

  readonly categories = computed(() => this.service.categorias.value() ?? []);
  readonly names = computed(() =>
    Array.from(new Set((this.service.productos.value() ?? []).map(p => p.name)))
  );
  readonly sinFiltro = computed(() => this.filter().name === '' && this.filter().category === '');
}
