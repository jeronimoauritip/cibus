import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { OrderInsight } from '../../models/order-insight';

@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-orders-report-component',
  styleUrl: './orders-report-component.css',
  templateUrl: './orders-report-component.html',
})
export class OrdersReportComponent {
  readonly report = input.required<OrderInsight>();

  
  readonly averagePosition = computed(() => {
    const { averageTicket, lowestValueOrder, highestValueOrder } = this.report();
    if (!lowestValueOrder || !highestValueOrder) return 0.5;

    const range = highestValueOrder.ticketValue - lowestValueOrder.ticketValue;
    if (range <= 0) return 0.5;

    const position = (averageTicket - lowestValueOrder.ticketValue) / range;
    return Math.min(Math.max(position, 0), 1);
  });
}
