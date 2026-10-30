import { Component, computed, input, output } from '@angular/core';
import { OrderDetail } from '../../models/order-detail';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  templateUrl: './order-confirm-component.html',
  styleUrl: './order-confirm-component.css'
})
export class OrderConfirmComponent {
  readonly items = input.required<OrderDetail[]>();
  readonly confirming = input.required<boolean>();
  readonly errorMessage = input<string | null>(null);
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.subtotal, 0)
  );

  onConfirm(): void { this.confirm.emit(); }
  onCancel(): void { this.cancel.emit(); }
}