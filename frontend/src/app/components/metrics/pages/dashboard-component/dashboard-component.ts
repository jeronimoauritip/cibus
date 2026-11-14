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

type RangePreset = '7d' | '30d' | '1y' | 'custom';

const PRESET_DAYS: Record<Exclude<RangePreset, 'custom'>, number> = {
  '7d': 7,
  '30d': 30,
  '1y': 365,
};


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
    readonly presets: { key: RangePreset; label: string }[] = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '1y', label: 'Last year' },
    { key: 'custom', label: 'Custom' },
  ];

  readonly selectedPreset = signal<RangePreset>('30d');
  readonly customStart = signal<string>('');
  readonly customEnd = signal<string>('');
  readonly today = this.toDateInputValue(new Date());

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
    return { branchId: this.selectedBranchId(), start: this.resolveStart(), end: this.resolveEnd() };
  });

  private resolveStart(): Date | undefined {
    const preset = this.selectedPreset();

    if (preset === 'custom') {
      return this.parseDateInput(this.customStart(), false);
    }

    const start = new Date();
    start.setDate(start.getDate() - PRESET_DAYS[preset]);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  // Presets omit the end (the backend defaults it to "now"); only custom sets it
  private resolveEnd(): Date | undefined {
    if (this.selectedPreset() !== 'custom') return undefined;

    const end = this.parseDateInput(this.customEnd(), true);
    const start = this.parseDateInput(this.customStart(), false);
    // Guard against an inverted range, which the backend rejects
    if (end && start && start > end) return undefined;
    return end;
  }

  // Parses a yyyy-MM-dd value as local time; endOfDay includes the whole selected day
  private parseDateInput(value: string, endOfDay: boolean): Date | undefined {
    if (!value) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    return endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day);
  }

  readonly ordersReport = this.metricsService.getOrdersReport(this.filter);
  readonly productsReport = this.metricsService.getProductsReport(this.filter);
  readonly waitersReport = this.metricsService.getWaitersReport(this.filter);

  selectBranch(value: string): void {
    if (this.isManager()) return; // Extra safety: managers cannot change the branch
    this.selectedBranchId.set(value ? Number(value) : undefined);
  }

  selectPreset(preset: RangePreset): void {
    this.selectedPreset.set(preset);
  }

  setCustomStart(value: string): void {
    this.customStart.set(value);
  }

  setCustomEnd(value: string): void {
    this.customEnd.set(value);
  }

  private toDateInputValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
