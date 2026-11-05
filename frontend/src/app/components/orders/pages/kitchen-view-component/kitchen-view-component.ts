import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../../Auth/services/auth-service';
import { HeaderComponent } from '../../../header-component/header-component';
import { KitchenOrderCardComponent } from '../../components/kitchen-order-card-component/kitchen-order-card-component';
import { OrderService } from '../../service/order-service';

@Component({
  selector: 'app-kitchen-view',
  imports: [HeaderComponent, KitchenOrderCardComponent],
  templateUrl: './kitchen-view-component.html',
  styleUrl: './kitchen-view-component.css'
})
export class KitchenViewComponent {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  private readonly branchId = computed(() => this.authService.user()?.branchId);

  private readonly preparingResource = this.orderService.getKitchenOrders(this.branchId, 'PREPARING');
  private readonly readyResource = this.orderService.getKitchenOrders(this.branchId, 'READY');

  readonly preparingOrders = computed(() => this.preparingResource.value()?.content ?? []);
  readonly readyOrders = computed(() => this.readyResource.value()?.content ?? []);

  // Orders beyond the page size that the board cannot show.
  readonly preparingOverflow = computed(
    () => (this.preparingResource.value()?.totalElements ?? 0) - this.preparingOrders().length
  );

  readonly loading = computed(
    () => this.preparingResource.isLoading() || this.readyResource.isLoading()
  );
  readonly loadFailed = computed(
    () => !!this.preparingResource.error() || !!this.readyResource.error()
  );

  readonly showReady = signal(true);
  readonly errorMessage = signal<string | null>(null);

  toggleReady(): void {
    this.showReady.update(value => !value);
  }

  markAsReady(orderId: number): void {
    const branchId = this.branchId();
    if (!branchId) return;

    this.errorMessage.set(null);
    this.orderService.changeStatus(branchId, orderId, 'READY').subscribe({
      next: () => {
        this.preparingResource.reload();
        this.readyResource.reload();
      },
      error: (err: HttpErrorResponse) =>
        this.errorMessage.set(err.error?.message ?? 'Could not mark the order as ready')
    });
  }
}
