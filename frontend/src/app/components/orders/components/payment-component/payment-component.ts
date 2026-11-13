import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { OrderPayment } from '../../models/order-payment';
import { PaymentMethod } from '../../models/payment-method';

interface PaymentLine {
  lineId: number;
  paymentMethodId: number;
  amount: number;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './payment-component.html',
  styleUrl: './payment-component.css',
})
export class PaymentComponent {
  readonly paymentMethods = input.required<PaymentMethod[]>();
  readonly subtotal = input.required<number>();
  readonly existingDiscount = input<number>(0);
  readonly remainingAmount = input.required<number>();
  readonly submitting = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly discountChange = output<number>();
  readonly confirmPayment = output<{ payments: OrderPayment[]; discount: number }>();
  readonly cancel = output<void>();

  private nextLineId = 1;

  readonly discountMode = signal<'amount' | 'percent'>('amount');
  readonly discountInput = signal<number>(0);
  readonly paymentLines = signal<PaymentLine[]>([]);
  private readonly autoSyncSingleLine = signal<boolean>(true);

  readonly maxDiscount = computed(() =>
    Math.max(0, roundCurrency(this.remainingAmount() - 0.01))
  );

  readonly rawDiscountAmount = computed(() => {
    const raw = this.discountInput();
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    if (this.discountMode() === 'percent') {
      return roundCurrency((this.remainingAmount() * raw) / 100);
    }
    return roundCurrency(raw);
  });

  readonly discountError = computed<string | null>(() => {
    const raw = this.discountInput();
    if (!Number.isFinite(raw) || raw < 0) {
      return 'Discount cannot be negative.';
    }
    if (this.discountMode() === 'percent' && raw >= 100) {
      return 'Discount must leave at least $0.01 to register a payment.';
    }
    if (this.rawDiscountAmount() > this.maxDiscount()) {
      return `Maximum allowed discount is ${this.maxDiscount().toFixed(2)} (at least $0.01 must be paid).`;
    }
    return null;
  });

  readonly appliedDraftDiscount = computed(() => {
    if (this.discountError() !== null) return 0;
    return this.rawDiscountAmount();
  });

  readonly netRemaining = computed(() =>
    Math.max(0, roundCurrency(this.remainingAmount() - this.appliedDraftDiscount()))
  );

  readonly allocatedTotal = computed(() =>
    roundCurrency(
      this.paymentLines().reduce(
        (sum, line) => sum + (Number.isFinite(line.amount) && line.amount > 0 ? line.amount : 0),
        0
      )
    )
  );

  readonly unallocatedBalance = computed(() =>
    roundCurrency(this.netRemaining() - this.allocatedTotal())
  );

  readonly canConfirm = computed(() => {
    if (this.submitting() || this.discountError() !== null) return false;
    if (this.netRemaining() <= 0) return false;
    const lines = this.paymentLines();
    if (lines.length === 0) return false;
    const allValid = lines.every(
      (l) => l.paymentMethodId > 0 && Number.isFinite(l.amount) && l.amount > 0
    );
    return allValid && Math.abs(this.unallocatedBalance()) < 0.005;
  });

  constructor() {
    effect(() => {
      const methods = this.paymentMethods();
      const due = this.netRemaining();
      const lines = this.paymentLines();

      if (methods.length === 0) return;

      if (lines.length === 0) {
        this.paymentLines.set([
          {
            lineId: this.nextLineId++,
            paymentMethodId: methods[0].id,
            amount: due,
          },
        ]);
        this.autoSyncSingleLine.set(true);
        return;
      }

      if (lines.length === 1 && this.autoSyncSingleLine()) {
        const current = lines[0];
        if (current.amount !== due) {
          this.paymentLines.set([{ ...current, amount: due }]);
        }
      }
    });
  }

  setDiscountMode(mode: 'amount' | 'percent'): void {
    if (this.discountMode() === mode) return;
    this.discountMode.set(mode);
    this.discountInput.set(0);
    this.discountChange.emit(0);
  }

  onDiscountInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement).value;
    const parsed = rawValue === '' ? 0 : Number(rawValue);
    this.discountInput.set(Number.isFinite(parsed) ? parsed : 0);
    this.discountChange.emit(this.appliedDraftDiscount());
  }

  selectQuickMethod(methodId: number): void {
    this.autoSyncSingleLine.set(true);
    this.paymentLines.set([
      {
        lineId: this.nextLineId++,
        paymentMethodId: methodId,
        amount: this.netRemaining(),
      },
    ]);
  }

  addPaymentLine(): void {
    const methods = this.paymentMethods();
    if (methods.length === 0) return;
    this.autoSyncSingleLine.set(false);
    const usedIds = new Set(this.paymentLines().map((l) => l.paymentMethodId));
    const preferred = methods.find((m) => !usedIds.has(m.id)) ?? methods[0];
    const pending = Math.max(0, this.unallocatedBalance());
    this.paymentLines.update((lines) => [
      ...lines,
      {
        lineId: this.nextLineId++,
        paymentMethodId: preferred.id,
        amount: pending,
      },
    ]);
  }

  removePaymentLine(lineId: number): void {
    this.paymentLines.update((lines) => {
      if (lines.length <= 1) return lines;
      const next = lines.filter((l) => l.lineId !== lineId);
      return next;
    });
  }

  updateLineMethod(lineId: number, event: Event): void {
    const methodId = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(methodId)) return;
    this.paymentLines.update((lines) =>
      lines.map((l) => (l.lineId === lineId ? { ...l, paymentMethodId: methodId } : l))
    );
  }

  updateLineAmount(lineId: number, event: Event): void {
    this.autoSyncSingleLine.set(false);
    const rawValue = (event.target as HTMLInputElement).value;
    const parsed = rawValue === '' ? 0 : roundCurrency(Number(rawValue));
    const safe = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    this.paymentLines.update((lines) =>
      lines.map((l) => (l.lineId === lineId ? { ...l, amount: safe } : l))
    );
  }

  fillRemainingOnLine(lineId: number): void {
    this.autoSyncSingleLine.set(false);
    const pending = this.unallocatedBalance();
    this.paymentLines.update((lines) =>
      lines.map((l) => {
        if (l.lineId !== lineId) return l;
        const nextAmount = Math.max(0, roundCurrency((l.amount || 0) + pending));
        return { ...l, amount: nextAmount };
      })
    );
  }

  onConfirm(): void {
    if (!this.canConfirm()) return;
    const payments: OrderPayment[] = this.paymentLines().map((l) => ({
      paymentMethodId: l.paymentMethodId,
      amount: roundCurrency(l.amount),
    }));
    this.confirmPayment.emit({
      payments,
      discount: this.appliedDraftDiscount(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isQuickSelected(methodId: number): boolean {
    const lines = this.paymentLines();
    return lines.length === 1 && lines[0].paymentMethodId === methodId;
  }

  get absUnallocated(): number {
    return Math.abs(this.unallocatedBalance());
  }
}

