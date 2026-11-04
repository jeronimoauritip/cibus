import { Component, input, output, signal } from '@angular/core';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-row',
  styleUrl: './product-row-component.css',
  templateUrl: './product-row-component.html',
})
export class ProductRowComponent {
  readonly product = input.required<Product>();
  
  // Nuevo Input para saber si estamos en el modal
  readonly isSelectionMode = input<boolean>(false); 

  readonly edit = output<Product>();
  readonly delete = output<Product>();
  
  // Nuevo Output para emitir la selección
  readonly selected = output<Product>(); 

  readonly confirming = signal(false);

  // Nueva función para cuando se hace clic (solo funciona en modo selección)
  onSelect(): void {
    if (this.isSelectionMode()) {
      this.selected.emit(this.product());
    }
  }

  onEdit(): void { this.edit.emit(this.product()); }
  onDeleteRequest(): void { this.confirming.set(true); }
  onDeleteConfirm(): void { this.delete.emit(this.product()); this.confirming.set(false); }
  onDeleteCancel(): void { this.confirming.set(false); }
}
