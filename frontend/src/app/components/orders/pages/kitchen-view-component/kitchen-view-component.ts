import { CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../../../../Auth/services/auth-service';
import { HeaderComponent } from '../../../header-component/header-component';
import {
  KITCHEN_STATUS_LABELS,
  KitchenOrderCardComponent,
  KitchenStatus
} from '../../components/kitchen-order-card-component/kitchen-order-card-component';
import { OrderResponse } from '../../models/order-response';
import { OrderService } from '../../service/order-service';
const REFRESH_INTERVAL_MS = 10_000;
const UNDO_TIMEOUT_MS = 6_000;

interface LastMove {
  orderId: number;
  from: KitchenStatus;
  to: KitchenStatus;
}

@Component({
  selector: 'app-kitchen-view',
  imports: [HeaderComponent, KitchenOrderCardComponent, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './kitchen-view-component.html',
  styleUrl: './kitchen-view-component.css'
})
export class KitchenViewComponent {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  logout(): void {
    this.authService.logout();
  }

  private readonly branchId = computed(() => this.authService.user()?.branchId);

  private readonly pendingResource = this.orderService.getKitchenOrders(this.branchId, 'PENDING');
  private readonly preparingResource = this.orderService.getKitchenOrders(this.branchId, 'PREPARING');
  private readonly readyResource = this.orderService.getKitchenOrders(this.branchId, 'READY');

  // Moves applied on screen before the server confirms them (orderId -> target column).
  private readonly overrides = signal<Record<number, KitchenStatus>>({});
  private readonly inFlight = signal(0);

  private readonly tagged = computed(() => [
    ...(this.pendingResource.value()?.content ?? []).map(order => ({ order, status: 'PENDING' as KitchenStatus })),
    ...(this.preparingResource.value()?.content ?? []).map(order => ({ order, status: 'PREPARING' as KitchenStatus })),
    ...(this.readyResource.value()?.content ?? []).map(order => ({ order, status: 'READY' as KitchenStatus }))
  ].map(entry => ({ order: entry.order, status: this.overrides()[entry.order.id] ?? entry.status })));

  private readonly statusById = computed(() => {
    const result: Record<number, KitchenStatus> = {};
    for (const entry of this.tagged()) result[entry.order.id] = entry.status;
    return result;
  });

  private columnOrders(status: KitchenStatus) {
    return computed(() =>
      this.tagged()
        .filter(entry => entry.status === status)
        .map(entry => entry.order)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  }

  readonly pendingOrders = this.columnOrders('PENDING');
  readonly preparingOrders = this.columnOrders('PREPARING');
  readonly readyOrders = this.columnOrders('READY');

  // Orders beyond the page size that the board cannot show.
  readonly pendingOverflow = computed(
    () => (this.pendingResource.value()?.totalElements ?? 0) - (this.pendingResource.value()?.content.length ?? 0)
  );
  readonly preparingOverflow = computed(
    () => (this.preparingResource.value()?.totalElements ?? 0) - (this.preparingResource.value()?.content.length ?? 0)
  );

  readonly loading = computed(
    () => this.pendingResource.isLoading() || this.preparingResource.isLoading() || this.readyResource.isLoading()
  );
  readonly loadFailed = computed(
    () => !!this.pendingResource.error() || !!this.preparingResource.error() || !!this.readyResource.error()
  );

  readonly showReady = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly lastMove = signal<LastMove | null>(null);
  readonly statusLabels = KITCHEN_STATUS_LABELS;
  // Touch needs a short press before dragging so scrolling does not move cards.
  readonly dragDelay = { touch: 120, mouse: 0 };

  private undoTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const timer = setInterval(() => this.refresh(), REFRESH_INTERVAL_MS);
    this.destroyRef.onDestroy(() => {
      clearInterval(timer);
      clearTimeout(this.undoTimer);
    });

    // Once every move is confirmed and the lists are fresh, the server is the source of truth again.
    effect(() => {
      if (this.inFlight() === 0 && !this.loading() && Object.keys(untracked(this.overrides)).length > 0) {
        this.overrides.set({});
      }
    });
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

  onDrop(event: CdkDragDrop<string, string, OrderResponse>): void {
    if (event.previousContainer === event.container) return;
    this.moveOrder(event.item.data.id, event.container.data as KitchenStatus);
  }

  moveOrder(orderId: number, target: KitchenStatus, recordUndo = true): void {
    const branchId = this.branchId();
    const from = this.statusById()[orderId];
    if (!branchId || !from || from === target) return;

    this.errorMessage.set(null);
    this.overrides.update(current => ({ ...current, [orderId]: target }));
    this.inFlight.update(count => count + 1);

    this.orderService.changeStatus(branchId, orderId, target).subscribe({
      next: () => {
        if (recordUndo) this.showUndo({ orderId, from, to: target });
        this.refresh();
        this.inFlight.update(count => count - 1);
      },
      error: (err: HttpErrorResponse) => {
        this.overrides.update(current => {
          const { [orderId]: _discarded, ...rest } = current;
          return rest;
        });
        this.inFlight.update(count => count - 1);
        this.errorMessage.set(err.error?.message ?? 'Could not move the order');
      }
    });
  }

  undo(): void {
    const move = this.lastMove();
    if (!move) return;
    this.dismissUndo();
    this.moveOrder(move.orderId, move.from, false);
  }

  dismissUndo(): void {
    clearTimeout(this.undoTimer);
    this.lastMove.set(null);
  }

  private showUndo(move: LastMove): void {
    clearTimeout(this.undoTimer);
    this.lastMove.set(move);
    this.undoTimer = setTimeout(() => this.lastMove.set(null), UNDO_TIMEOUT_MS);
  }
}
