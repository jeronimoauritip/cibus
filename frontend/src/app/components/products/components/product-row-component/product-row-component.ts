import { Component, input, output, signal } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-row',
  styleUrl: './product-row-component.css',
  templateUrl: './product-row-component.html',
})
export class ProductRowComponent {
  readonly product = input.required<Product>();
  readonly edit = output<Product>();
  readonly delete = output<Product>();
  readonly confirming = signal(false);

  onEdit(): void { this.edit.emit(this.product()); }
  onDeleteRequest(): void { this.confirming.set(true); }
  onDeleteConfirm(): void { this.delete.emit(this.product()); this.confirming.set(false); }
  onDeleteCancel(): void { this.confirming.set(false); }
}
