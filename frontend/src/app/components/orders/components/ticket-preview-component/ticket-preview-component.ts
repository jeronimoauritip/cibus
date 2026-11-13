import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { OrderResponse } from '../../models/order-response';

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

@Component({
  selector: 'app-ticket-preview',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './ticket-preview-component.html',
  styleUrl: './ticket-preview-component.css',
})
export class TicketPreviewComponent {
  readonly order = input.required<OrderResponse>();
  readonly draftDiscount = input<number>(0);

  readonly sanitizedDraftDiscount = computed(() =>
    Math.max(0, Number.isFinite(this.draftDiscount()) ? this.draftDiscount() : 0)
  );

  readonly alreadyPaid = computed(() =>
    Math.max(0, roundCurrency(this.order().finalTotal - this.order().remainingAmount))
  );

  readonly totalDiscount = computed(() =>
    roundCurrency(this.order().discount + this.sanitizedDraftDiscount())
  );

  readonly netTotal = computed(() =>
    Math.max(0, roundCurrency(this.order().subtotal - this.totalDiscount()))
  );

  readonly netRemaining = computed(() =>
    Math.max(0, roundCurrency(this.order().remainingAmount - this.sanitizedDraftDiscount()))
  );
}

