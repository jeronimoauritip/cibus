import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { OrderPayment } from '../../models/order-payment';
import { PaymentMethod } from '../../models/payment-method';
import { TableBill } from '../../models/table-bill';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './receipt-component.html',
  styleUrl: './receipt-component.css',
})
export class ReceiptComponent {
  readonly bill = input.required<TableBill>();
  readonly payments = input<OrderPayment[]>([]);
  readonly paymentMethods = input<PaymentMethod[]>([]);
  readonly freeingTable = input<boolean>(false);
  readonly tableAlreadyFree = input<boolean>(false);

  readonly finishAndFreeTable = output<void>();
  readonly finishKeepTable = output<void>();
  readonly printReceipt = output<void>();

  readonly orderIdsLabel = computed(() =>
    this.bill()
      .orders.map((o) => `#${o.id}`)
      .join(', ')
  );

  readonly allItems = computed(() =>
    this.bill().orders.flatMap((o) => o.items ?? [])
  );

  readonly paymentBreakdown = computed(() => {
    const methodById = new Map(this.paymentMethods().map((m) => [m.id, m.name]));
    const sourcePayments =
      this.payments().length > 0 ? this.payments() : (this.bill().payments ?? []);
    return sourcePayments.map((p) => ({
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

