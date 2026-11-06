import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BranchService } from '../../../branches/service/branch-service';
import { HeaderComponent } from '../../../header-component/header-component';
import { MetricsFilter } from '../../models/metrics-filter';
import { MetricsService } from '../../service/metrics-service';
import { ProductsReportComponent } from '../../components/products-report-component/products-report-component';
import { OrdersReportComponent } from '../../components/orders-report-component/orders-report-component';
import { WaitersReportComponent } from '../../components/waiters-report-component/waiters-report-component';
import { RouterLink } from '@angular/router';
type ReportTab = 'orders' | 'products' | 'waiters';

@Component({
  imports: [HeaderComponent,RouterLink, ProductsReportComponent, OrdersReportComponent, WaitersReportComponent],
  selector: 'app-dashboard-component',
  styleUrl: './dashboard-component.css',
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent {
  private readonly branchService = inject(BranchService);
  private readonly metricsService = inject(MetricsService);

  readonly tabs: { key: ReportTab; label: string }[] = [
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products' },
    { key: 'waiters', label: 'Waiters' },
  ];

  readonly branches = toSignal(this.branchService.findAll(), { initialValue: [] });
  readonly selectedBranchId = signal<number | undefined>(undefined);
  readonly activeTab = signal<ReportTab>('orders');

  private readonly filter = computed<MetricsFilter>(() => ({
    branchId: this.selectedBranchId(),
  }));

  readonly ordersReport = this.metricsService.getOrdersReport(this.filter);
  readonly productsReport = this.metricsService.getProductsReport(this.filter);
  readonly waitersReport = this.metricsService.getWaitersReport(this.filter);

  selectBranch(value: string): void {
    this.selectedBranchId.set(value ? Number(value) : undefined);
  }
}
