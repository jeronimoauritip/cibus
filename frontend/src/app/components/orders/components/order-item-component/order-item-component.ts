import { Component, input, output } from '@angular/core';
import { OrderDetail } from '../../models/order-detail';

@Component({
  selector: 'app-order-item',
  standalone: true,
  templateUrl: './order-item-component.html',
  styleUrl: './order-item-component.css'
})
export class OrderItemComponent {
  readonly item = input.required<OrderDetail>();
  readonly quantityChange = output<number>();
  readonly observationChange = output<string>();
  readonly remove = output<void>();

  onDecrement(): void {
    this.quantityChange.emit(this.item().quantity - 1);
  }

  onIncrement(): void {
    this.quantityChange.emit(this.item().quantity + 1);
  }

  onQuantityInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!isNaN(value)) this.quantityChange.emit(value);
  }

  onObservationChange(event: Event): void {
    this.observationChange.emit((event.target as HTMLInputElement).value);
  }

  onRemove(): void {
    this.remove.emit();
  }
}
