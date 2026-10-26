import { Component, inject, model, OnInit, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { FiltroProducto } from '../../models/filtro-producto';
import { ProductService } from '../../service/product-service';

@Component({
  selector: 'app-product-filter-component',
  templateUrl: './product-filter-component.html',
  styleUrl: './product-filter-component.css'
})
export class ProductFilterComponent implements OnInit {
  readonly filter = model.required<FiltroProducto>();
  readonly filtro = form(this.filter);
  private readonly service = inject(ProductService);
  readonly categories = signal<string[]>([]);
  mostrarCategoria = false;

  ngOnInit(): void {
    this.service.getCategories().subscribe({
      next: cats => this.categories.set(cats.map(c => c.name))
    });
  }
}