import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BranchService } from '../../../branches/service/branch-service';
import { HeaderComponent } from '../../../header-component/header-component';
import { MetricsFilter } from '../../models/metrics-filter';
import { MetricsService } from '../../service/metrics-service';
import { ProductsReportComponent } from '../../components/products-report-component/products-report-component';
import { OrdersReportComponent } from '../../components/orders-report-component/orders-report-component';
import { WaitersReportComponent } from '../../components/waiters-report-component/waiters-report-component';
import { BackButtonDirective } from '../../../back-button/back-button.directive';
import { AuthService } from '../../../../Auth/services/auth-service';
import { EMPTY } from 'rxjs';

type ReportTab = 'orders' | 'products' | 'waiters';

@Component({
  imports: [HeaderComponent, BackButtonDirective, ProductsReportComponent, OrdersReportComponent, WaitersReportComponent],
  selector: 'app-dashboard-component',
  styleUrl: './dashboard-component.css',
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);
  private readonly branchService = inject(BranchService);
  private readonly metricsService = inject(MetricsService);

  readonly tabs: { key: ReportTab; label: string }[] = [
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products' },
    { key: 'waiters', label: 'Waiters' },
  ];

  // Only load all branches if the user is an Admin
  readonly branches = toSignal(
    this.auth.isAdmin() ? this.branchService.findAll() : EMPTY, 
    { initialValue: [] }
  );
  
  readonly selectedBranchId = signal<number | undefined>(undefined);
  readonly activeTab = signal<ReportTab>('orders');
  readonly isManager = computed(() => this.auth.role() === 'Manager');

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (this.isManager() && user?.branchId != null) {
        // Lock the filter to the manager's branch
        this.selectedBranchId.set(user.branchId);
      }
    }, { allowSignalWrites: true });
  }

  // Filter signal consumed by MetricsService
  private readonly filter = computed<MetricsFilter>(() => {
    // If it's a manager but the profile hasn't loaded yet, return a dummy filter 
    // to prevent fetching global stats by accident
    if (this.isManager() && this.selectedBranchId() === undefined) {
      return { branchId: -1 }; // Invalid ID ensures it won't hit global or leak data
    }
    return { branchId: this.selectedBranchId() };
  });

  readonly ordersReport = this.metricsService.getOrdersReport(this.filter);
  readonly productsReport = this.metricsService.getProductsReport(this.filter);
  readonly waitersReport = this.metricsService.getWaitersReport(this.filter);

  selectBranch(value: string): void {
    if (this.isManager()) return; // Extra safety: managers cannot change the branch
    this.selectedBranchId.set(value ? Number(value) : undefined);
  }
}
