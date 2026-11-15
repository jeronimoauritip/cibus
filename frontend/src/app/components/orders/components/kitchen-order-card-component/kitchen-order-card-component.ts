import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { OrderResponse } from '../../models/order-response';

export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY';

export const KITCHEN_STATUSES: readonly KitchenStatus[] = ['PENDING', 'PREPARING', 'READY'];

const LATE_THRESHOLD_SECONDS = 15 * 60;

export const KITCHEN_STATUS_LABELS: Record<KitchenStatus, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready'
};

@Component({
  selector: 'app-kitchen-order-card',
  imports: [DatePipe],
  templateUrl: './kitchen-order-card-component.html',
  styleUrl: './kitchen-order-card-component.css'
})
export class KitchenOrderCardComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly order = input.required<OrderResponse>();
  readonly status = input.required<KitchenStatus>();
  readonly move = output<KitchenStatus>();

  readonly menuOpen = signal(false);

  private readonly now = signal(Date.now());

  readonly showTimer = computed(() => this.status() !== 'READY');

  readonly elapsedSeconds = computed(() =>
    Math.max(0, Math.floor((this.now() - new Date(this.order().createdAt).getTime()) / 1000))
  );

  readonly isLate = computed(() => this.elapsedSeconds() >= LATE_THRESHOLD_SECONDS);

  readonly elapsedLabel = computed(() => {
    const total = this.elapsedSeconds();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
  });

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  readonly options = computed(() =>
    KITCHEN_STATUSES.filter(status => status !== this.status()).map(status => ({
      status,
      label: KITCHEN_STATUS_LABELS[status]
    }))
  );

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  select(status: KitchenStatus): void {
    this.menuOpen.set(false);
    this.move.emit(status);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.menuOpen.set(false);
  }
}
