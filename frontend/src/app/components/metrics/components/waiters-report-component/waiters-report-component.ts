import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { WaiterInsight } from '../../models/waiter-insight';


const TOP_SIZE = 5;


const MIN_RATIO = 0.04;

@Component({
  imports: [DecimalPipe],
  selector: 'app-waiters-report-component',
  styleUrl: './waiters-report-component.css',
  templateUrl: './waiters-report-component.html',
})
export class WaitersReportComponent {
  readonly report = input.required<WaiterInsight>();

  readonly topByRevenue = computed(() => this.report().facturationRanking.slice(0, TOP_SIZE));
  readonly topByOrders = computed(() => this.report().ordersQuantityRanking.slice(0, TOP_SIZE));

  
  readonly maxRevenue = computed(() =>
    Math.max(0, ...this.topByRevenue().map(waiter => waiter.facturation))
  );
  readonly maxOrders = computed(() =>
    Math.max(0, ...this.topByOrders().map(waiter => waiter.ordersServed))
  );

  readonly hasData = computed(
    () => this.topByRevenue().length > 0 || this.topByOrders().length > 0
  );

  ratio(value: number, max: number): number {
    return max > 0 ? Math.max(value / max, MIN_RATIO) : 0;
  }
}
