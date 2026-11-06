import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ProductInsight } from '../../models/product-insight';

const MIN_RATIO = 0.04;

@Component({
  imports: [DecimalPipe],
  selector: 'app-products-report-component',
  styleUrl: './products-report-component.css',
  templateUrl: './products-report-component.html',
})
export class ProductsReportComponent {
  readonly report = input.required<ProductInsight>();

  
  readonly maxTimesSold = computed(() => this.report().mostPopularProduct?.timesSold ?? 0);
  readonly maxPrice = computed(() => this.report().mostExpensiveProduct?.productPrice ?? 0);
  readonly maxCategoryTimesSold = computed(() => this.report().mostPopularCategory?.timesSold ?? 0);

  readonly hasData = computed(
    () => !!this.report().mostPopularProduct || !!this.report().mostPopularCategory
  );

  ratio(value: number, max: number): number {
    return max > 0 ? Math.max(value / max, MIN_RATIO) : 0;
  }
}
