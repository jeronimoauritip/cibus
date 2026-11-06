import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed,DestroyRef, inject, signal } from '@angular/core';
import { AuthService } from '../../../../Auth/services/auth-service';
import { HeaderComponent } from '../../../header-component/header-component';
import { KitchenOrderCardComponent } from '../../components/kitchen-order-card-component/kitchen-order-card-component';
import { OrderService } from '../../service/order-service';
const REFRESH_INTERVAL_MS = 10_000;

@Component({
  selector: 'app-kitchen-view',
  imports: [HeaderComponent, KitchenOrderCardComponent],
  templateUrl: './kitchen-view-component.html',
  styleUrl: './kitchen-view-component.css'
})
export class KitchenViewComponent {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly branchId = computed(() => this.authService.user()?.branchId);

  private readonly pendingResource = this.orderService.getKitchenOrders(this.branchId, 'PENDING');
  private readonly preparingResource = this.orderService.getKitchenOrders(this.branchId, 'PREPARING');
  private readonly readyResource = this.orderService.getKitchenOrders(this.branchId, 'READY');

  readonly pendingOrders = computed(() => this.pendingResource.value()?.content ?? []);
  readonly preparingOrders = computed(() => this.preparingResource.value()?.content ?? []);
  readonly readyOrders = computed(() => this.readyResource.value()?.content ?? []);

  // Orders beyond the page size that the board cannot show.
  readonly pendingOverflow = computed(
    () => (this.pendingResource.value()?.totalElements ?? 0) - this.pendingOrders().length
  );
  readonly preparingOverflow = computed(
    () => (this.preparingResource.value()?.totalElements ?? 0) - this.preparingOrders().length
  );

  readonly loading = computed(
    () => this.pendingResource.isLoading() || this.preparingResource.isLoading() || this.readyResource.isLoading()
  );
  readonly loadFailed = computed(
    () => !!this.pendingResource.error() || !!this.preparingResource.error() || !!this.readyResource.error()
  );

  readonly showReady = signal(true);
  readonly errorMessage = signal<string | null>(null);
   constructor() {
    const timer = setInterval(() => this.refresh(), REFRESH_INTERVAL_MS);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  private refresh(): void {
    if (document.hidden) return;
    this.pendingResource.reload();
    this.preparingResource.reload();
    this.readyResource.reload();
  }


  toggleReady(): void {
    this.showReady.update(value => !value);
  }

  startPreparing(orderId: number): void {
    this.changeStatus(orderId, 'PREPARING', 'Could not start preparing the order');
  }

  markAsReady(orderId: number): void {
    this.changeStatus(orderId, 'READY', 'Could not mark the order as ready');
  }

  private changeStatus(orderId: number, status: 'PREPARING' | 'READY', fallbackMessage: string): void {
    const branchId = this.branchId();
    if (!branchId) return;

    this.errorMessage.set(null);
    this.orderService.changeStatus(branchId, orderId, status).subscribe({
      next: () => this.refresh(),
      error: (err: HttpErrorResponse) =>
        this.errorMessage.set(err.error?.message ?? fallbackMessage)
    });
  }
}
