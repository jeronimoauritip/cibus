import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TableBill } from '../../models/table-bill';

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
  readonly bill = input.required<TableBill>();
  readonly draftDiscount = input<number>(0);

  readonly sanitizedDraftDiscount = computed(() =>
    Math.max(0, Number.isFinite(this.draftDiscount()) ? this.draftDiscount() : 0)
  );

  readonly orderIdsLabel = computed(() =>
    this.bill()
      .orders.map((o) => `#${o.id}`)
      .join(', ')
  );

  readonly totalItemsCount = computed(() =>
    this.bill().orders.reduce((sum, ord) => sum + (ord.items?.length ?? 0), 0)
  );

  readonly alreadyPaid = computed(() =>
    Math.max(
      0,
      roundCurrency(
        this.bill().totalPaid ?? this.bill().finalTotal - this.bill().remainingAmount
      )
    )
  );

  readonly totalDiscount = computed(() =>
    roundCurrency(this.bill().discount + this.sanitizedDraftDiscount())
  );

  readonly netTotal = computed(() =>
    Math.max(0, roundCurrency(this.bill().subtotal - this.totalDiscount()))
  );

  readonly netRemaining = computed(() =>
    Math.max(0, roundCurrency(this.bill().remainingAmount - this.sanitizedDraftDiscount()))
  );
}

