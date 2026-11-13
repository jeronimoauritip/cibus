import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { OrderPayment } from '../../models/order-payment';
import { OrderResponse } from '../../models/order-response';
import { PaymentMethod } from '../../models/payment-method';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './receipt-component.html',
  styleUrl: './receipt-component.css',
})
export class ReceiptComponent {
  readonly order = input.required<OrderResponse>();
  readonly payments = input<OrderPayment[]>([]);
  readonly paymentMethods = input<PaymentMethod[]>([]);
  readonly freeingTable = input<boolean>(false);
  readonly tableAlreadyFree = input<boolean>(false);

  readonly finishAndFreeTable = output<void>();
  readonly finishKeepTable = output<void>();
  readonly printReceipt = output<void>();

  readonly paymentBreakdown = computed(() => {
    const methodById = new Map(this.paymentMethods().map((m) => [m.id, m.name]));
    return this.payments().map((p) => ({
      methodName: methodById.get(p.paymentMethodId) ?? `Method #${p.paymentMethodId}`,
      amount: p.amount,
    }));
  });

  onFinishAndFreeTable(): void {
    this.finishAndFreeTable.emit();
  }

  onFinishKeepTable(): void {
    this.finishKeepTable.emit();
  }

  onPrint(): void {
    this.printReceipt.emit();
  }
}

